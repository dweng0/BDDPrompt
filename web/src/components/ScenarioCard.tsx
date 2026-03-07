import React from "react";
import type { ScenarioData } from "../types";

type Props = {
  scenario: ScenarioData;
};

export default function ScenarioCard({ scenario }: Props) {
  return (
    <div
      data-testid={`scenario-card-${scenario.name}`}
      className="scenario-card"
    >
      <span>{scenario.name}</span>
    </div>
  );
}
