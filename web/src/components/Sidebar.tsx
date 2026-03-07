import React from "react";

const PALETTE_ITEMS = [
  {
    id: "feature",
    label: "Feature",
    description: "A group of scenarios",
    color: "bg-indigo-100 border-indigo-300 text-indigo-800",
    icon: "◈",
  },
  {
    id: "scenario",
    label: "Scenario",
    description: "Given / When / Then",
    color: "bg-emerald-100 border-emerald-300 text-emerald-800",
    icon: "◇",
  },
];

export default function Sidebar() {
  function handleDragStart(e: React.DragEvent, type: string) {
    e.dataTransfer.setData("bdd/node-type", type);
    e.dataTransfer.effectAllowed = "copy";
  }

  return (
    <aside
      data-testid="sidebar"
      className="w-52 shrink-0 bg-gray-900 text-white flex flex-col gap-2 p-3 overflow-y-auto"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
        Palette
      </p>
      {PALETTE_ITEMS.map(({ id, label, description, color, icon }) => (
        <div
          key={id}
          data-testid={`palette-${id}`}
          draggable
          onDragStart={(e) => handleDragStart(e, id)}
          className={`flex items-start gap-2 p-3 rounded-lg border cursor-grab active:cursor-grabbing select-none ${color} hover:brightness-95 transition-all`}
        >
          <span className="text-lg leading-none mt-0.5">{icon}</span>
          <div>
            <p className="font-semibold text-sm leading-tight">{label}</p>
            <p className="text-xs opacity-70">{description}</p>
          </div>
        </div>
      ))}

      <div className="mt-auto pt-4 border-t border-gray-700 text-xs text-gray-500 leading-relaxed">
        Drag items onto the canvas. Drop Scenarios inside Features.
      </div>
    </aside>
  );
}
