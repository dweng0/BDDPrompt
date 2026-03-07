import React from "react";
import type { FeatureData, ScenarioData } from "../types";

type Selection =
  | { type: "feature"; featureIndex: number; feature: FeatureData }
  | { type: "scenario"; featureIndex: number; scenarioIndex: number; scenario: ScenarioData };

type Props = {
  selection: Selection;
  onUpdateFeature: (featureIndex: number, patch: Partial<FeatureData>) => void;
  onUpdateScenario: (featureIndex: number, scenarioIndex: number, patch: Partial<ScenarioData>) => void;
};

export default function PropertiesPanel({ selection, onUpdateFeature, onUpdateScenario }: Props) {
  if (selection.type === "feature") {
    const { feature, featureIndex } = selection;
    return (
      <aside data-testid="properties-panel" className="properties-panel">
        <p>Feature</p>
        <input
          data-testid="properties-name-input"
          value={feature.name}
          onChange={(e) => onUpdateFeature(featureIndex, { name: e.target.value })}
        />
      </aside>
    );
  }

  const { scenario, featureIndex, scenarioIndex } = selection;
  return (
    <aside data-testid="properties-panel" className="properties-panel">
      <p>Scenario</p>
      <input
        data-testid="properties-name-input"
        value={scenario.name}
        onChange={(e) => onUpdateScenario(featureIndex, scenarioIndex, { name: e.target.value })}
      />
      <input
        data-testid="properties-given-input"
        value={scenario.given}
        onChange={(e) => onUpdateScenario(featureIndex, scenarioIndex, { given: e.target.value })}
      />
      <input
        data-testid="properties-when-input"
        value={scenario.when}
        onChange={(e) => onUpdateScenario(featureIndex, scenarioIndex, { when: e.target.value })}
      />
      <input
        data-testid="properties-then-input"
        value={scenario.then}
        onChange={(e) => onUpdateScenario(featureIndex, scenarioIndex, { then: e.target.value })}
      />
    </aside>
  );
}

export type { Selection };
