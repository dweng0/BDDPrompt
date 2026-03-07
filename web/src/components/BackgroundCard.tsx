import React from "react";
import type { BackgroundData } from "../types";

type Props = {
  featureIndex: number;
  background: BackgroundData;
  onSelect?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
};

export default function BackgroundCard({ featureIndex, background, onSelect, onDelete }: Props) {
  return (
    <div
      data-testid="background-card"
      onClick={onSelect}
      className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 cursor-pointer hover:bg-amber-100 hover:border-amber-400 transition-colors group"
    >
      <div className="flex items-center gap-1.5">
        <span className="text-amber-500 text-xs">⬡</span>
        <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Background</span>
        <button
          data-testid={`delete-background-${featureIndex}`}
          onClick={onDelete}
          className="ml-auto text-gray-300 hover:text-red-500 transition-colors text-xs opacity-0 group-hover:opacity-100 px-1"
          title="Delete background"
        >
          ✕
        </button>
      </div>
      {background.given && (
        <p className="text-xs text-gray-600 mt-1">Given {background.given}</p>
      )}
    </div>
  );
}
