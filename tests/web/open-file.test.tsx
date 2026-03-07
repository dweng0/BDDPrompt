// @vitest-environment happy-dom
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import App from "../../web/src/App";

const SAMPLE_BDD = `---
language: typescript
framework: react
build_cmd: npm run build
test_cmd: npm test
lint_cmd: npm run lint
fmt_cmd: npm run format
birth_date: 2026-03-07
---

System: a sample system

    Feature: User Auth

        Scenario: login success
            Given a registered user
            When they submit valid credentials
            Then they are logged in
`;

function mockFileSystem(content: string) {
  const file = new File([content], "BDD.md", { type: "text/markdown" });
  const fileHandle = {
    getFile: () => Promise.resolve(file),
  };
  vi.stubGlobal("showOpenFilePicker", () => Promise.resolve([fileHandle]));
}

describe("user opens a BDD.md file and it populates the canvas", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("canvas populates with features and scenarios from the opened file", async () => {
    mockFileSystem(SAMPLE_BDD);
    render(<App />);

    fireEvent.click(screen.getByTestId("open-file-btn"));

    await screen.findByText("User Auth");
    expect(screen.getByTestId("feature-card-User Auth")).toBeInTheDocument();
    expect(screen.getByText("login success")).toBeInTheDocument();
  });
});
