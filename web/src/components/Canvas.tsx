import React from "react";
import type { FeatureData } from "../types";
import FeatureCard from "./FeatureCard";

type Props = {
  features: FeatureData[];
  onDrop?: (nodeType: string) => void;
  onDropScenario?: (featureIndex: number) => void;
};

export default function Canvas({ features, onDrop, onDropScenario }: Props) {
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
        />
      ))}
    </div>
  );
}
