import React from "react";
import type { ScenarioData } from "../types";

type Props = {
  featureIndex: number;
  scenarioIndex: number;
  scenario: ScenarioData;
  onSelect?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
};

export default function ScenarioCard({ featureIndex, scenarioIndex, scenario, onSelect, onDelete }: Props) {
  return (
    <div
      data-testid={`scenario-card-${scenario.name}`}
      onClick={onSelect}
      className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 cursor-pointer hover:bg-emerald-100 hover:border-emerald-400 transition-colors group"
    >
      <div className="flex items-center gap-1.5">
        <span className="text-emerald-500 text-xs">◇</span>
        <span className="text-sm font-medium text-gray-700 truncate flex-1">{scenario.name}</span>
        <button
          data-testid={`delete-scenario-${featureIndex}-${scenarioIndex}`}
          onClick={onDelete}
          className="text-gray-300 hover:text-red-500 transition-colors text-xs opacity-0 group-hover:opacity-100 px-1"
          title="Delete scenario"
        >
          ✕
        </button>
      </div>
      {scenario.given && (
        <p className="text-xs text-gray-400 mt-1 truncate">Given {scenario.given}</p>
      )}
    </div>
  );
}
