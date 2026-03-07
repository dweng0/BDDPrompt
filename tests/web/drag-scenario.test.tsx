// @vitest-environment happy-dom
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "../../web/src/App";

function makeDragTransfer(type: string) {
  const data: Record<string, string> = { "bdd/node-type": type };
  return {
    dataTransfer: {
      setData: (key: string, val: string) => { data[key] = val; },
      getData: (key: string) => data[key] ?? "",
    },
  };
}

describe("user drags a scenario into a feature card", () => {
  it("a new Scenario card appears inside the Feature card after drop", () => {
    render(<App />);

    // First drop a feature onto the canvas
    const paletteFeature = screen.getByTestId("palette-feature");
    const canvas = screen.getByTestId("canvas");
    const featureTransfer = makeDragTransfer("feature");
    fireEvent.dragStart(paletteFeature, featureTransfer);
    fireEvent.dragOver(canvas, featureTransfer);
    fireEvent.drop(canvas, featureTransfer);

    // Now drop a scenario into the feature card
    const paletteScenario = screen.getByTestId("palette-scenario");
    const featureCard = screen.getByTestId(/^feature-card-/);
    const scenarioTransfer = makeDragTransfer("scenario");
    fireEvent.dragStart(paletteScenario, scenarioTransfer);
    fireEvent.dragOver(featureCard, scenarioTransfer);
    fireEvent.drop(featureCard, scenarioTransfer);

    expect(screen.getByTestId(/^scenario-card-/)).toBeInTheDocument();
  });
});
