import React, { useState } from "react";
import type { FeatureData } from "../types";
import ScenarioCard from "./ScenarioCard";
import BackgroundCard from "./BackgroundCard";

type Props = {
  featureIndex: number;
  feature: FeatureData;
  onDropScenario?: () => void;
  onDropBackground?: () => void;
  onSelect?: () => void;
  onSelectScenario?: (scenarioIndex: number) => void;
  onSelectBackground?: () => void;
  onDelete?: () => void;
  onDeleteScenario?: (scenarioIndex: number) => void;
  onDeleteBackground?: () => void;
};

export default function FeatureCard({ featureIndex, feature, onDropScenario, onDropBackground, onSelect, onSelectScenario, onSelectBackground, onDelete, onDeleteScenario, onDeleteBackground }: Props) {
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
    if (nodeType === "background" && !feature.background && onDropBackground) onDropBackground();
  }

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (onSelect) onSelect();
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (onDelete) onDelete();
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
        <h2 className="text-white font-semibold text-sm truncate flex-1">{feature.name}</h2>
        <button
          data-testid={`delete-feature-${featureIndex}`}
          onClick={handleDelete}
          className="text-indigo-300 hover:text-white transition-colors text-xs px-1"
          title="Delete feature"
        >
          ✕
        </button>
      </div>

      {/* Scenario list */}
      <div
        className={`p-3 min-h-24 flex flex-col gap-2 transition-colors ${
          isDragOver ? "bg-emerald-50 ring-2 ring-inset ring-emerald-300" : "bg-white"
        }`}
      >
        {feature.background && (
          <BackgroundCard
            featureIndex={featureIndex}
            background={feature.background}
            onSelect={onSelectBackground ? (e) => { e.stopPropagation(); onSelectBackground(); } : undefined}
            onDelete={onDeleteBackground ? (e) => { e.stopPropagation(); onDeleteBackground(); } : undefined}
          />
        )}
        {feature.scenarios.length === 0 && !feature.background && (
          <p className="text-xs text-gray-400 text-center mt-4 select-none pointer-events-none">
            Drop Scenarios or a Background here
          </p>
        )}
        {feature.scenarios.map((scenario, index) => (
          <ScenarioCard
            key={`${scenario.name}-${index}`}
            featureIndex={featureIndex}
            scenarioIndex={index}
            scenario={scenario}
            onSelect={onSelectScenario ? (e) => { e.stopPropagation(); onSelectScenario(index); } : undefined}
            onDelete={onDeleteScenario ? (e) => { e.stopPropagation(); onDeleteScenario(index); } : undefined}
          />
        ))}
      </div>
    </div>
  );
}
