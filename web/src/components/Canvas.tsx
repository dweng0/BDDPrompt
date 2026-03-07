import React from "react";
import type { FeatureData } from "../types";
import FeatureCard from "./FeatureCard";

type Props = {
  features: FeatureData[];
  onDrop?: (nodeType: string) => void;
  onDropScenario?: (featureIndex: number) => void;
  onSelectFeature?: (featureIndex: number) => void;
  onSelectScenario?: (featureIndex: number, scenarioIndex: number) => void;
};

export default function Canvas({ features, onDrop, onDropScenario, onSelectFeature, onSelectScenario }: Props) {
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const nodeType = e.dataTransfer.getData("bdd/node-type");
    if (nodeType && onDrop) onDrop(nodeType);
  }

  return (
    <div
      data-testid="canvas"
      className="canvas"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {features.map((feature, index) => (
        <FeatureCard
          key={`${feature.name}-${index}`}
          feature={feature}
          onDropScenario={onDropScenario ? () => onDropScenario(index) : undefined}
          onSelect={onSelectFeature ? () => onSelectFeature(index) : undefined}
          onSelectScenario={onSelectScenario ? (si) => onSelectScenario(index, si) : undefined}
        />
      ))}
    </div>
  );
}
