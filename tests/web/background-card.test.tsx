// @vitest-environment happy-dom
import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "../../web/src/App";
import Canvas from "../../web/src/components/Canvas";
import type { FeatureData } from "../../web/src/types";

function makeDragTransfer(type: string) {
  const data: Record<string, string> = { "bdd/node-type": type };
  return {
    dataTransfer: {
      setData: (_k: string, v: string) => {
        data[_k] = v;
      },
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

describe("background is displayed inside its feature card", () => {
  it("background card is shown inside the feature card when present", () => {
    const features: FeatureData[] = [
      {
        name: "Auth",
        background: { given: "the database is seeded" },
        scenarios: [],
      },
    ];
    render(<Canvas features={features} />);
    const featureCard = screen.getByTestId("feature-card-Auth");
    expect(
      within(featureCard).getByTestId("background-card"),
    ).toBeInTheDocument();
    expect(
      within(featureCard).getByText(/the database is seeded/),
    ).toBeInTheDocument();
  });
});

describe("user adds a background to a feature card", () => {
  it("background card appears after dragging Background node into the feature", () => {
    render(<App />);
    dropFeature();

    const featureCard = screen.getByTestId(/^feature-card-/);
    const bt = makeDragTransfer("background");
    fireEvent.dragStart(screen.getByTestId("palette-background"), bt);
    fireEvent.dragOver(featureCard, bt);
    fireEvent.drop(featureCard, bt);

    expect(screen.getByTestId("background-card")).toBeInTheDocument();
  });
});

describe("user edits a background via the properties panel", () => {
  it("properties panel shows editable Given field when background is clicked", () => {
    render(<App />);
    dropFeature();

    const featureCard = screen.getByTestId(/^feature-card-/);
    const bt = makeDragTransfer("background");
    fireEvent.dragStart(screen.getByTestId("palette-background"), bt);
    fireEvent.dragOver(featureCard, bt);
    fireEvent.drop(featureCard, bt);

    fireEvent.click(screen.getByTestId("background-card"));

    expect(screen.getByTestId("properties-panel")).toBeInTheDocument();
    expect(screen.getByTestId("properties-given-input")).toBeInTheDocument();
  });
});

describe("user deletes a background from a feature card", () => {
  it("background card is removed after clicking delete", () => {
    render(<App />);
    dropFeature();

    const featureCard = screen.getByTestId(/^feature-card-/);
    const bt = makeDragTransfer("background");
    fireEvent.dragStart(screen.getByTestId("palette-background"), bt);
    fireEvent.dragOver(featureCard, bt);
    fireEvent.drop(featureCard, bt);

    expect(screen.getByTestId("background-card")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("delete-background-0"));

    expect(screen.queryByTestId("background-card")).not.toBeInTheDocument();
  });
});
