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
      onClick={onSelect}
      className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 cursor-pointer hover:bg-emerald-100 hover:border-emerald-400 transition-colors"
    >
      <div className="flex items-center gap-1.5">
        <span className="text-emerald-500 text-xs">◇</span>
        <span className="text-sm font-medium text-gray-700 truncate">{scenario.name}</span>
      </div>
      {scenario.given && (
        <p className="text-xs text-gray-400 mt-1 truncate">Given {scenario.given}</p>
      )}
    </div>
  );
}
