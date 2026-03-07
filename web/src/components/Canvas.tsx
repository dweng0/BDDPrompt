import React from "react";
import type { FeatureData } from "../types";
import FeatureCard from "./FeatureCard";

type Props = {
  features: FeatureData[];
};

export default function Canvas({ features }: Props) {
  return (
    <div data-testid="canvas" className="canvas">
      {features.map((feature) => (
        <FeatureCard key={feature.name} feature={feature} />
      ))}
    </div>
  );
}
