// @vitest-environment happy-dom
import React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Canvas from "../../web/src/components/Canvas";
import type { FeatureData } from "../../web/src/types";

describe("canvas displays feature and scenario cards from state", () => {
  it("each feature is displayed as a card on the canvas", () => {
    const features: FeatureData[] = [
      {
        name: "User Authentication",
        background: null,
        scenarios: [],
      },
    ];
    render(<Canvas features={features} />);
    expect(screen.getByText("User Authentication")).toBeInTheDocument();
  });

  it("each scenario is displayed as a card inside its parent feature card", () => {
    const features: FeatureData[] = [
      {
        name: "User Authentication",
        background: null,
        scenarios: [
          {
            name: "Login success",
            given: "a user",
            when: "they log in",
            then: "they are authenticated",
          },
          {
            name: "Login failure",
            given: "a user",
            when: "they use wrong password",
            then: "they see an error",
          },
        ],
      },
    ];
    render(<Canvas features={features} />);

    const featureCard = screen.getByTestId("feature-card-User Authentication");
    expect(within(featureCard).getByText("Login success")).toBeInTheDocument();
    expect(within(featureCard).getByText("Login failure")).toBeInTheDocument();
  });
});
