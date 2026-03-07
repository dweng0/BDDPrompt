import React, { useState } from "react";
import type { FeatureData } from "../types";
import ScenarioCard from "./ScenarioCard";

type Props = {
  feature: FeatureData;
  onDropScenario?: () => void;
  onSelect?: () => void;
  onSelectScenario?: (scenarioIndex: number) => void;
};

export default function FeatureCard({ feature, onDropScenario, onSelect, onSelectScenario }: Props) {
  const [isDragOver, setIsDragOver] = useState(false);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const nodeType = e.dataTransfer.getData("bdd/node-type");
    if (nodeType === "scenario" && onDropScenario) onDropScenario();
  }

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (onSelect) onSelect();
  }

  return (
    <div
      data-testid={`feature-card-${feature.name}`}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="w-72 rounded-xl shadow-md bg-white border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
    >
      {/* Header */}
      <div className="bg-indigo-600 px-4 py-3 flex items-center gap-2">
        <span className="text-indigo-200 text-sm">◈</span>
        <h2 className="text-white font-semibold text-sm truncate">{feature.name}</h2>
      </div>

      {/* Scenario drop zone */}
      <div
        className={`p-3 min-h-24 flex flex-col gap-2 transition-colors ${
          isDragOver ? "bg-emerald-50 ring-2 ring-inset ring-emerald-300" : "bg-white"
        }`}
      >
        {feature.scenarios.length === 0 && (
          <p className="text-xs text-gray-400 text-center mt-4 select-none pointer-events-none">
            Drop Scenarios here
          </p>
        )}
        {feature.scenarios.map((scenario, index) => (
          <ScenarioCard
            key={`${scenario.name}-${index}`}
            scenario={scenario}
            onSelect={onSelectScenario ? (e) => { e.stopPropagation(); onSelectScenario(index); } : undefined}
          />
        ))}
      </div>
    </div>
  );
}
