import React, { useState, useRef, useCallback, useEffect } from "react";
import type { BddDocument, FeatureData, ScenarioData } from "./types";
import Canvas from "./components/Canvas";
import Sidebar from "./components/Sidebar";
import PropertiesPanel, { type Selection } from "./components/PropertiesPanel";
// Selection type is extended in PropertiesPanel to include background
import FrontmatterBar from "./components/FrontmatterBar";
import ChatPanel from "./components/ChatPanel";
import { parseBdd } from "./utils/bddParser";
import { generateBddContent } from "./utils/bddWriter";
import { useWebRTC } from "./hooks/useWebRTC";

function emptyDocument(): BddDocument {
  return {
    frontmatter: {
      language: "",
      framework: "",
      build_cmd: "",
      test_cmd: "",
      lint_cmd: "",
      fmt_cmd: "",
      birth_date: new Date().toISOString().slice(0, 10),
    },
    system_description: "",
    features: [],
  };
}

type AppProps = {
  pollInterval?: number;
};

export default function App({ pollInterval = 2000 }: AppProps) {
  const [doc, setDoc] = useState<BddDocument>(emptyDocument);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [sessionFull, setSessionFull] = useState(false);
  const fileHandleRef = useRef<FileSystemFileHandle | null>(null);
  const lastModifiedRef = useRef<number>(0);

  const webrtc = useWebRTC({
    onDocUpdate: (remoteDoc) => setDoc(remoteDoc),
  });

  const writeToFile = useCallback(async (updatedDoc: BddDocument) => {
    const handle = fileHandleRef.current;
    if (!handle) return;
    try {
      const writable = await (handle as any).createWritable();
      await writable.write(generateBddContent(updatedDoc));
      await writable.close();
    } catch {
      // file write failed silently
    }
  }, []);

  useEffect(() => {
    const id = setInterval(async () => {
      const handle = fileHandleRef.current;
      if (!handle) return;
      try {
        const file = await (handle as any).getFile();
        if (file.lastModified !== lastModifiedRef.current) {
          lastModifiedRef.current = file.lastModified;
          const text = await file.text();
          setDoc(parseBdd(text));
        }
      } catch {
        // poll failed silently
      }
    }, pollInterval);
    return () => clearInterval(id);
  }, [pollInterval]);

  function setDocAndSave(updater: (prev: BddDocument) => BddDocument) {
    setDoc((prev) => {
      const next = updater(prev);
      writeToFile(next);
      webrtc.broadcastDoc(next);
      return next;
    });
  }

  function addFeature() {
    setDocAndSave((prev) => ({
      ...prev,
      features: [
        ...prev.features,
        { name: "New Feature", background: null, scenarios: [] },
      ],
    }));
  }

  function addScenarioToFeature(featureIndex: number) {
    setDocAndSave((prev) => {
      const features = prev.features.map((f, i) => {
        if (i !== featureIndex) return f;
        return {
          ...f,
          scenarios: [
            ...f.scenarios,
            { name: "New Scenario", given: "", when: "", then: "" },
          ],
        };
      });
      return { ...prev, features };
    });
  }

  function handleCanvasDrop(nodeType: string) {
    if (nodeType === "feature") addFeature();
  }

  async function handleOpenFile() {
    try {
      const [fileHandle] = await (window as any).showOpenFilePicker({
        types: [{ description: "BDD files", accept: { "text/markdown": [".md"] } }],
      });
      fileHandleRef.current = fileHandle;
      const file = await fileHandle.getFile();
      lastModifiedRef.current = file.lastModified;
      setFileName(file.name);
      const text = await file.text();
      setDoc(parseBdd(text));
      setSelection(null);
    } catch {
      // user cancelled
    }
  }

  async function handleSaveAs() {
    try {
      const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: "BDD.md",
        types: [{ description: "BDD files", accept: { "text/markdown": [".md"] } }],
      });
      fileHandleRef.current = fileHandle;
      const file = await fileHandle.getFile();
      lastModifiedRef.current = file.lastModified;
      setFileName(fileHandle.name);
      await writeToFile(doc);
    } catch {
      // user cancelled
    }
  }

  function updateFrontmatter(patch: Partial<BddDocument["frontmatter"]>) {
    setDocAndSave((prev) => ({
      ...prev,
      frontmatter: { ...prev.frontmatter, ...patch },
    }));
  }

  function updateSystemDescription(value: string) {
    setDocAndSave((prev) => ({ ...prev, system_description: value }));
  }

  function addBackground(featureIndex: number) {
    setDocAndSave((prev) => ({
      ...prev,
      features: prev.features.map((f, i) =>
        i === featureIndex ? { ...f, background: { given: "" } } : f
      ),
    }));
  }

  function deleteBackground(featureIndex: number) {
    setDocAndSave((prev) => ({
      ...prev,
      features: prev.features.map((f, i) =>
        i === featureIndex ? { ...f, background: null } : f
      ),
    }));
    setSelection(null);
  }

  function selectBackground(featureIndex: number) {
    const bg = doc.features[featureIndex].background;
    if (bg) setSelection({ type: "background", featureIndex, background: bg });
  }

  function updateBackground(featureIndex: number, given: string) {
    setDocAndSave((prev) => ({
      ...prev,
      features: prev.features.map((f, i) =>
        i === featureIndex ? { ...f, background: { given } } : f
      ),
    }));
    setSelection((prev) =>
      prev?.type === "background" && prev.featureIndex === featureIndex
        ? { ...prev, background: { given } }
        : prev
    );
  }

  function deleteFeature(featureIndex: number) {
    setDocAndSave((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== featureIndex),
    }));
    setSelection(null);
  }

  function deleteScenario(featureIndex: number, scenarioIndex: number) {
    setDocAndSave((prev) => ({
      ...prev,
      features: prev.features.map((f, fi) =>
        fi !== featureIndex ? f : {
          ...f,
          scenarios: f.scenarios.filter((_, si) => si !== scenarioIndex),
        }
      ),
    }));
    setSelection(null);
  }

  function updateFeature(featureIndex: number, patch: Partial<FeatureData>) {
    setDocAndSave((prev) => {
      const features = prev.features.map((f, i) =>
        i === featureIndex ? { ...f, ...patch } : f
      );
      return { ...prev, features };
    });
    setSelection((prev) =>
      prev?.type === "feature" && prev.featureIndex === featureIndex
        ? { ...prev, feature: { ...prev.feature, ...patch } }
        : prev
    );
  }

  function updateScenario(featureIndex: number, scenarioIndex: number, patch: Partial<ScenarioData>) {
    setDocAndSave((prev) => {
      const features = prev.features.map((f, fi) => {
        if (fi !== featureIndex) return f;
        return {
          ...f,
          scenarios: f.scenarios.map((s, si) =>
            si === scenarioIndex ? { ...s, ...patch } : s
          ),
        };
      });
      return { ...prev, features };
    });
    setSelection((prev) =>
      prev?.type === "scenario" && prev.featureIndex === featureIndex && prev.scenarioIndex === scenarioIndex
        ? { ...prev, scenario: { ...prev.scenario, ...patch } }
        : prev
    );
  }

  function selectFeature(featureIndex: number) {
    setSelection({ type: "feature", featureIndex, feature: doc.features[featureIndex] });
  }

  function selectScenario(featureIndex: number, scenarioIndex: number) {
    setSelection({
      type: "scenario",
      featureIndex,
      scenarioIndex,
      scenario: doc.features[featureIndex].scenarios[scenarioIndex],
    });
  }

  async function handleShare() {
    try {
      await webrtc.startHost();
    } catch {
      // signaling server unavailable
    }
  }

  async function handleJoin() {
    if (!joinCode.trim()) return;
    setJoinError(null);
    try {
      await webrtc.joinSession(joinCode.trim().toUpperCase());
      setShowJoinDialog(false);
      setJoinCode("");
    } catch {
      setJoinError("Could not connect. Check the share code and try again.");
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      {/* Toolbar */}
      <header className="flex items-center gap-4 px-4 py-2 bg-gray-900 text-white shadow z-10">
        <span className="font-bold text-lg tracking-tight">bddprompt</span>
        <button
          data-testid="open-file-btn"
          onClick={handleOpenFile}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded text-sm font-medium transition-colors"
        >
          Open BDD.md
        </button>
        <button
          data-testid="save-as-btn"
          onClick={handleSaveAs}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded text-sm font-medium transition-colors"
        >
          Save As
        </button>
        {fileHandleRef.current && (
          <span className="ml-auto text-xs text-green-400">● live sync — {fileName}</span>
        )}

        {/* Presence indicators */}
        {webrtc.connectedPeers.length > 0 && (
          <div data-testid="presence-indicators" className="flex items-center gap-1">
            {webrtc.connectedPeers.map((peerId) => (
              <div
                key={peerId}
                data-testid={`peer-indicator-${peerId}`}
                title={`Peer: ${peerId}`}
                className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold"
              >
                {peerId.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
        )}

        <button
          data-testid="share-btn"
          onClick={handleShare}
          className="ml-auto px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded text-sm font-medium transition-colors"
        >
          Share
        </button>
        <button
          data-testid="join-btn"
          onClick={() => { setShowJoinDialog(true); setJoinError(null); }}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium transition-colors"
        >
          Join
        </button>
        <button
          data-testid="chat-toggle-btn"
          onClick={() => setChatOpen((o) => !o)}
          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded text-sm font-medium transition-colors"
        >
          Chat
        </button>
      </header>

      {/* Share Code Display */}
      {webrtc.shareCode && (
        <div className="flex items-center gap-2 px-4 py-2 bg-green-900 border-b border-green-700">
          <span className="text-xs text-green-300">Share this code with others:</span>
          <span data-testid="share-code" className="font-mono font-bold text-green-400">
            {webrtc.shareCode}
          </span>
          <span className="text-xs text-green-400">
            ({webrtc.connectedPeers.length}/{MAX_PEERS} connected)
          </span>
          <button
            onClick={webrtc.disconnect}
            className="ml-auto text-xs text-green-500 hover:text-green-300"
          >
            Close
          </button>
        </div>
      )}

      {/* Session Full Banner */}
      {sessionFull && (
        <div data-testid="session-full-banner" className="px-4 py-2 bg-red-900 border-b border-red-700 text-sm text-red-200">
          This session is full (4 users maximum).
        </div>
      )}

      {/* Join Dialog */}
      {showJoinDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 text-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="font-semibold mb-4">Join Collaboration Session</h3>
            <input
              data-testid="join-share-code-input"
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter share code (e.g., ABC123)"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm mb-2 focus:outline-none focus:border-blue-500"
              maxLength={6}
            />
            {joinError && (
              <p data-testid="join-error" className="text-red-400 text-xs mb-3">{joinError}</p>
            )}
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => { setShowJoinDialog(false); setJoinCode(""); setJoinError(null); }}
                className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
              >
                Cancel
              </button>
              <button
                data-testid="join-confirm-btn"
                onClick={handleJoin}
                className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}

      <FrontmatterBar
        doc={doc}
        onUpdateFrontmatter={updateFrontmatter}
        onUpdateSystem={updateSystemDescription}
      />

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <Canvas
          features={doc.features}
          onDrop={handleCanvasDrop}
          onDropScenario={addScenarioToFeature}
          onDropBackground={addBackground}
          onSelectFeature={selectFeature}
          onSelectScenario={selectScenario}
          onSelectBackground={selectBackground}
          onDeleteFeature={deleteFeature}
          onDeleteScenario={deleteScenario}
          onDeleteBackground={deleteBackground}
        />
        {selection && (
          <PropertiesPanel
            selection={selection}
            onUpdateFeature={updateFeature}
            onUpdateScenario={updateScenario}
            onUpdateBackground={updateBackground}
          />
        )}
        <ChatPanel
          isOpen={chatOpen}
          doc={fileName ? doc : null}
          onDocUpdate={(updatedDoc) => {
            setDoc(updatedDoc);
            writeToFile(updatedDoc);
            webrtc.broadcastDoc(updatedDoc);
          }}
        />
      </div>
    </div>
  );
}

const MAX_PEERS = 3;
