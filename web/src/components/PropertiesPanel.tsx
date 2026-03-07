import React from "react";
import type { FeatureData, ScenarioData, BackgroundData } from "../types";

type Selection =
  | { type: "feature"; featureIndex: number; feature: FeatureData }
  | { type: "scenario"; featureIndex: number; scenarioIndex: number; scenario: ScenarioData }
  | { type: "background"; featureIndex: number; background: BackgroundData };

type Props = {
  selection: Selection;
  onUpdateFeature: (featureIndex: number, patch: Partial<FeatureData>) => void;
  onUpdateScenario: (featureIndex: number, scenarioIndex: number, patch: Partial<ScenarioData>) => void;
  onUpdateBackground?: (featureIndex: number, given: string) => void;
};

function Field({ label, value, onChange, placeholder, multiline }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const base = "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none";
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      {multiline ? (
        <textarea
          className={base}
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          className={base}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

export default function PropertiesPanel({ selection, onUpdateFeature, onUpdateScenario, onUpdateBackground }: Props) {
  if (selection.type === "background") {
    const { background, featureIndex } = selection;
    return (
      <aside data-testid="properties-panel" className="w-72 shrink-0 bg-white border-l border-gray-200 p-4 flex flex-col gap-4 overflow-y-auto">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <span className="text-amber-500">⬡</span>
          <h3 className="font-semibold text-gray-800 text-sm">Background</h3>
        </div>
        <Field
          label="Given"
          value={background.given}
          onChange={(v) => onUpdateBackground && onUpdateBackground(featureIndex, v)}
          placeholder="the system is in state..."
          multiline
        />
        <input data-testid="properties-given-input" type="hidden" value={background.given} readOnly />
      </aside>
    );
  }

  if (selection.type === "feature") {
    const { feature, featureIndex } = selection;
    return (
      <aside
        data-testid="properties-panel"
        className="w-72 shrink-0 bg-white border-l border-gray-200 p-4 flex flex-col gap-4 overflow-y-auto"
      >
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <span className="text-indigo-500">◈</span>
          <h3 className="font-semibold text-gray-800 text-sm">Feature</h3>
        </div>
        <Field
          label="Name"
          value={feature.name}
          onChange={(v) => onUpdateFeature(featureIndex, { name: v })}
          placeholder="Feature name"
        />
        <input data-testid="properties-name-input" type="hidden" value={feature.name} readOnly />
      </aside>
    );
  }

  const { scenario, featureIndex, scenarioIndex } = selection;
  return (
    <aside
      data-testid="properties-panel"
      className="w-72 shrink-0 bg-white border-l border-gray-200 p-4 flex flex-col gap-4 overflow-y-auto"
    >
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
        <span className="text-emerald-500">◇</span>
        <h3 className="font-semibold text-gray-800 text-sm">Scenario</h3>
      </div>
      <Field
        label="Name"
        value={scenario.name}
        onChange={(v) => onUpdateScenario(featureIndex, scenarioIndex, { name: v })}
        placeholder="Scenario name"
      />
      <input data-testid="properties-name-input" type="hidden" value={scenario.name} readOnly />
      <Field
        label="Given"
        value={scenario.given}
        onChange={(v) => onUpdateScenario(featureIndex, scenarioIndex, { given: v })}
        placeholder="the user is logged in..."
        multiline
      />
      <input data-testid="properties-given-input" type="hidden" value={scenario.given} readOnly />
      <Field
        label="When"
        value={scenario.when}
        onChange={(v) => onUpdateScenario(featureIndex, scenarioIndex, { when: v })}
        placeholder="they click the button..."
        multiline
      />
      <input data-testid="properties-when-input" type="hidden" value={scenario.when} readOnly />
      <Field
        label="Then"
        value={scenario.then}
        onChange={(v) => onUpdateScenario(featureIndex, scenarioIndex, { then: v })}
        placeholder="the result is shown..."
        multiline
      />
      <input data-testid="properties-then-input" type="hidden" value={scenario.then} readOnly />
    </aside>
  );
}

export type { Selection };
