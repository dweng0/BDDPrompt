// @vitest-environment happy-dom
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "../../web/src/App";

function makeDragTransfer(_type: string) {
  const data: Record<string, string> = {};
  return {
    dataTransfer: {
      setData: (key: string, val: string) => {
        data[key] = val;
      },
      getData: (key: string) => data[key] ?? "",
    },
  };
}

describe("user drags a feature onto the canvas", () => {
  it("a new empty Feature card appears on the canvas after drop", () => {
    render(<App />);

    const paletteFeature = screen.getByTestId("palette-feature");
    const canvas = screen.getByTestId("canvas");

    const transfer = makeDragTransfer("feature");

    fireEvent.dragStart(paletteFeature, transfer);
    fireEvent.dragOver(canvas, transfer);
    fireEvent.drop(canvas, transfer);

    expect(screen.getAllByTestId(/^feature-card-/).length).toBeGreaterThan(0);
  });
});
