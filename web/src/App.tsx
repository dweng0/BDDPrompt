import React, { useState } from "react";
import type { BddDocument, FeatureData } from "./types";
import Canvas from "./components/Canvas";
import Sidebar from "./components/Sidebar";

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

  function addFeature() {
    const newFeature: FeatureData = {
      name: "New Feature",
      background: null,
      scenarios: [],
    };
    setDoc((prev) => ({
      ...prev,
      features: [...prev.features, newFeature],
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

  return (
    <div className="app">
      <Sidebar />
      <Canvas
        features={doc.features}
        onDrop={handleCanvasDrop}
        onDropScenario={addScenarioToFeature}
      />
    </div>
  );
}
