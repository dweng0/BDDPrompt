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

describe("user edits a card via the properties panel", () => {
  it("clicking a Feature card shows editable fields in the properties panel", () => {
    render(<App />);

    // Drop a feature onto the canvas
    const transfer = makeDragTransfer("feature");
    fireEvent.dragStart(screen.getByTestId("palette-feature"), transfer);
    fireEvent.dragOver(screen.getByTestId("canvas"), transfer);
    fireEvent.drop(screen.getByTestId("canvas"), transfer);

    // Click the feature card
    fireEvent.click(screen.getByTestId(/^feature-card-/));

    // Properties panel should show an editable name field
    expect(screen.getByTestId("properties-panel")).toBeInTheDocument();
    expect(screen.getByTestId("properties-name-input")).toBeInTheDocument();
  });

  it("clicking a Scenario card shows editable Given/When/Then fields", () => {
    render(<App />);

    // Drop feature then scenario
    const ft = makeDragTransfer("feature");
    fireEvent.dragStart(screen.getByTestId("palette-feature"), ft);
    fireEvent.dragOver(screen.getByTestId("canvas"), ft);
    fireEvent.drop(screen.getByTestId("canvas"), ft);

    const st = makeDragTransfer("scenario");
    const featureCard = screen.getByTestId(/^feature-card-/);
    fireEvent.dragStart(screen.getByTestId("palette-scenario"), st);
    fireEvent.dragOver(featureCard, st);
    fireEvent.drop(featureCard, st);

    // Click the scenario card
    fireEvent.click(screen.getByTestId(/^scenario-card-/));

    expect(screen.getByTestId("properties-panel")).toBeInTheDocument();
    expect(screen.getByTestId("properties-given-input")).toBeInTheDocument();
    expect(screen.getByTestId("properties-when-input")).toBeInTheDocument();
    expect(screen.getByTestId("properties-then-input")).toBeInTheDocument();
  });
});
