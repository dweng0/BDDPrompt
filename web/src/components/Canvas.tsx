import React, { useState } from "react";
import type { FeatureData } from "../types";
import FeatureCard from "./FeatureCard";

type Props = {
  features: FeatureData[];
  onDrop?: (nodeType: string) => void;
  onDropScenario?: (featureIndex: number) => void;
  onSelectFeature?: (featureIndex: number) => void;
  onSelectScenario?: (featureIndex: number, scenarioIndex: number) => void;
  onDeleteFeature?: (featureIndex: number) => void;
  onDeleteScenario?: (featureIndex: number, scenarioIndex: number) => void;
  onDropBackground?: (featureIndex: number) => void;
  onSelectBackground?: (featureIndex: number) => void;
  onDeleteBackground?: (featureIndex: number) => void;
};

export default function Canvas({ features, onDrop, onDropScenario, onSelectFeature, onSelectScenario, onDeleteFeature, onDeleteScenario, onDropBackground, onSelectBackground, onDeleteBackground }: Props) {
  const [isDragOver, setIsDragOver] = useState(false);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const nodeType = e.dataTransfer.getData("bdd/node-type");
    if (nodeType && onDrop) onDrop(nodeType);
  }

  return (
    <div
      data-testid="canvas"
      className={`flex-1 overflow-auto p-6 transition-colors ${
        isDragOver ? "bg-indigo-50 ring-2 ring-inset ring-indigo-300" : "bg-gray-100"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {features.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 select-none pointer-events-none">
          <span className="text-5xl mb-3">◈</span>
          <p className="text-lg font-medium">Drag a Feature here to get started</p>
          <p className="text-sm mt-1">or open an existing BDD.md file</p>
        </div>
      )}
      <div className="flex flex-wrap gap-4 items-start content-start">
        {features.map((feature, index) => (
          <FeatureCard
            key={`${feature.name}-${index}`}
            featureIndex={index}
            feature={feature}
            onDropScenario={onDropScenario ? () => onDropScenario(index) : undefined}
            onSelect={onSelectFeature ? () => onSelectFeature(index) : undefined}
            onSelectScenario={onSelectScenario ? (si) => onSelectScenario(index, si) : undefined}
            onDelete={onDeleteFeature ? () => onDeleteFeature(index) : undefined}
            onDeleteScenario={onDeleteScenario ? (si) => onDeleteScenario(index, si) : undefined}
            onDropBackground={onDropBackground ? () => onDropBackground(index) : undefined}
            onSelectBackground={onSelectBackground ? () => onSelectBackground(index) : undefined}
            onDeleteBackground={onDeleteBackground ? () => onDeleteBackground(index) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
