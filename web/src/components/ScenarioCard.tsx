import React from "react";
import type { ScenarioData } from "../types";

type Props = {
  scenario: ScenarioData;
  onSelect?: (e: React.MouseEvent) => void;
};

export default function ScenarioCard({ scenario, onSelect }: Props) {
  return (
    <div
      data-testid={`scenario-card-${scenario.name}`}
      className="scenario-card"
      onClick={onSelect}
    >
      <span>{scenario.name}</span>
    </div>
  );
}
