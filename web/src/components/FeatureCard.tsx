import React from "react";
import type { FeatureData } from "../types";
import ScenarioCard from "./ScenarioCard";

type Props = {
  feature: FeatureData;
  onDropScenario?: () => void;
  onSelect?: () => void;
  onSelectScenario?: (scenarioIndex: number) => void;
};

export default function FeatureCard({ feature, onDropScenario, onSelect, onSelectScenario }: Props) {
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

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (onSelect) onSelect();
  }

  return (
    <div
      data-testid={`feature-card-${feature.name}`}
      className="feature-card"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <h2>{feature.name}</h2>
      <div className="feature-card__scenarios">
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
