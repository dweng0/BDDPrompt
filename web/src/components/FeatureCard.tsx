import React from "react";
import type { FeatureData } from "../types";
import ScenarioCard from "./ScenarioCard";

type Props = {
  feature: FeatureData;
};

export default function FeatureCard({ feature }: Props) {
  return (
    <div
      data-testid={`feature-card-${feature.name}`}
      className="feature-card"
    >
      <h2>{feature.name}</h2>
      <div className="feature-card__scenarios">
        {feature.scenarios.map((scenario) => (
          <ScenarioCard key={scenario.name} scenario={scenario} />
        ))}
      </div>
    </div>
  );
}
