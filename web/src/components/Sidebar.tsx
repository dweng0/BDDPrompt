import React from "react";

const PALETTE_ITEMS = [
  { id: "feature", label: "Feature" },
  { id: "scenario", label: "Scenario" },
];

export default function Sidebar() {
  function handleDragStart(e: React.DragEvent, type: string) {
    e.dataTransfer.setData("bdd/node-type", type);
  }

  return (
    <aside data-testid="sidebar" className="sidebar">
      <p className="sidebar__title">Palette</p>
      {PALETTE_ITEMS.map(({ id, label }) => (
        <div
          key={id}
          data-testid={`palette-${id}`}
          draggable
          onDragStart={(e) => handleDragStart(e, id)}
          className="palette-item"
        >
          {label}
        </div>
      ))}
    </aside>
  );
}
