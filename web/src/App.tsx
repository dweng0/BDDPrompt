import React, { useState, useRef, useCallback, useEffect } from "react";
import type { BddDocument, FeatureData, ScenarioData } from "./types";
import Canvas from "./components/Canvas";
import Sidebar from "./components/Sidebar";
import PropertiesPanel, { type Selection } from "./components/PropertiesPanel";
import { parseBdd } from "./utils/bddParser";
import { generateBddContent } from "./utils/bddWriter";

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
  const fileHandleRef = useRef<FileSystemFileHandle | null>(null);
  const lastModifiedRef = useRef<number>(0);

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
      const text = await file.text();
      setDoc(parseBdd(text));
      setSelection(null);
    } catch {
      // user cancelled
    }
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

  return (
    <div className="app">
      <button data-testid="open-file-btn" onClick={handleOpenFile}>
        Open BDD.md
      </button>
      <Sidebar />
      <Canvas
        features={doc.features}
        onDrop={handleCanvasDrop}
        onDropScenario={addScenarioToFeature}
        onSelectFeature={selectFeature}
        onSelectScenario={selectScenario}
      />
      {selection && (
        <PropertiesPanel
          selection={selection}
          onUpdateFeature={updateFeature}
          onUpdateScenario={updateScenario}
        />
      )}
    </div>
  );
}
