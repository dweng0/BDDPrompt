import React, { useState } from "react";
import type { BddDocument, FeatureData, ScenarioData } from "./types";
import Canvas from "./components/Canvas";
import Sidebar from "./components/Sidebar";
import PropertiesPanel, { type Selection } from "./components/PropertiesPanel";
import { parseBdd } from "./utils/bddParser";

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

export default function App() {
  const [doc, setDoc] = useState<BddDocument>(emptyDocument);
  const [selection, setSelection] = useState<Selection | null>(null);

  function addFeature() {
    setDoc((prev) => ({
      ...prev,
      features: [
        ...prev.features,
        { name: "New Feature", background: null, scenarios: [] },
      ],
    }));
  }

  function addScenarioToFeature(featureIndex: number) {
    setDoc((prev) => {
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
      const file = await fileHandle.getFile();
      const text = await file.text();
      setDoc(parseBdd(text));
      setSelection(null);
    } catch {
      // user cancelled
    }
  }

  function updateFeature(featureIndex: number, patch: Partial<FeatureData>) {
    setDoc((prev) => {
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
    setDoc((prev) => {
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
