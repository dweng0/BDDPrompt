import React from "react";
import type { FeatureData } from "../types";
import ScenarioCard from "./ScenarioCard";

type Props = {
  feature: FeatureData;
  onDropScenario?: () => void;
};

export default function FeatureCard({ feature, onDropScenario }: Props) {
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const nodeType = e.dataTransfer.getData("bdd/node-type");
    if (nodeType === "scenario" && onDropScenario) onDropScenario();
  }

  return (
    <div
      data-testid={`feature-card-${feature.name}`}
      className="feature-card"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <h2>{feature.name}</h2>
      <div className="feature-card__scenarios">
        {feature.scenarios.map((scenario) => (
          <ScenarioCard key={scenario.name} scenario={scenario} />
        ))}
      </div>
    </div>
  );
}
