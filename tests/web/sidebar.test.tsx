// @vitest-environment happy-dom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Sidebar from "../../web/src/components/Sidebar";

describe("sidebar shows draggable node types", () => {
  it("can see a draggable Feature node type", () => {
    render(<Sidebar />);
    const featureNode = screen.getByTestId("palette-feature");
    expect(featureNode).toBeInTheDocument();
    expect(featureNode).toHaveAttribute("draggable", "true");
  });

  it("can see a draggable Scenario node type", () => {
    render(<Sidebar />);
    const scenarioNode = screen.getByTestId("palette-scenario");
    expect(scenarioNode).toBeInTheDocument();
    expect(scenarioNode).toHaveAttribute("draggable", "true");
  });
});
