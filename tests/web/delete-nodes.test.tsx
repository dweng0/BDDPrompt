// @vitest-environment happy-dom
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "../../web/src/App";

function makeDragTransfer(type: string) {
  const data: Record<string, string> = { "bdd/node-type": type };
  return {
    dataTransfer: {
      setData: (_k: string, v: string) => { data[_k] = v; },
      getData: (k: string) => data[k] ?? "",
    },
  };
}

function dropFeature() {
  const ft = makeDragTransfer("feature");
  fireEvent.dragStart(screen.getByTestId("palette-feature"), ft);
  fireEvent.dragOver(screen.getByTestId("canvas"), ft);
  fireEvent.drop(screen.getByTestId("canvas"), ft);
}

function dropScenario() {
  const st = makeDragTransfer("scenario");
  const featureCard = screen.getByTestId(/^feature-card-/);
  fireEvent.dragStart(screen.getByTestId("palette-scenario"), st);
  fireEvent.dragOver(featureCard, st);
  fireEvent.drop(featureCard, st);
}

describe("user deletes a feature from the canvas", () => {
  it("Feature card is removed from the canvas after clicking delete", () => {
    render(<App />);
    dropFeature();

    expect(screen.getByTestId(/^feature-card-/)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("delete-feature-0"));

    expect(screen.queryByTestId(/^feature-card-/)).not.toBeInTheDocument();
  });
});

describe("user deletes a scenario from a feature", () => {
  it("Scenario card is removed from the feature after clicking delete", () => {
    render(<App />);
    dropFeature();
    dropScenario();

    expect(screen.getByTestId(/^scenario-card-/)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("delete-scenario-0-0"));

    expect(screen.queryByTestId(/^scenario-card-/)).not.toBeInTheDocument();
  });
});
