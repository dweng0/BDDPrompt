// @vitest-environment happy-dom
// coverage: external changes to bddmd are reflected on the canvas
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import App from "../../web/src/App";

const INITIAL_BDD = `---
language: typescript
framework: react
build_cmd: npm run build
test_cmd: npm test
lint_cmd: npm run lint
fmt_cmd: npm run format
birth_date: 2026-03-07
---

System: a sample system
`;

const UPDATED_BDD = `---
language: typescript
framework: react
build_cmd: npm run build
test_cmd: npm test
lint_cmd: npm run lint
fmt_cmd: npm run format
birth_date: 2026-03-07
---

System: a sample system

    Feature: Externally Added Feature

        Scenario: added externally
            Given an external editor
            When it saves the file
            Then the canvas updates
`;

describe("external changes to BDD.md are reflected on the canvas", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("canvas updates when BDD.md is modified externally", async () => {
    let callCount = 0;
    const writable = {
      write: vi.fn(() => Promise.resolve()),
      close: vi.fn(() => Promise.resolve()),
    };
    const fileHandle = {
      getFile: vi.fn(() => {
        callCount++;
        const content = callCount <= 1 ? INITIAL_BDD : UPDATED_BDD;
        const lastModified = callCount <= 1 ? 1000 : 2000;
        return Promise.resolve(new File([content], "BDD.md", { lastModified }));
      }),
      createWritable: vi.fn(() => Promise.resolve(writable)),
    };
    vi.stubGlobal("showOpenFilePicker", () => Promise.resolve([fileHandle]));

    render(<App pollInterval={500} />);

    // Open the file
    await act(async () => {
      fireEvent.click(screen.getByTestId("open-file-btn"));
    });

    expect(
      screen.queryByText("Externally Added Feature"),
    ).not.toBeInTheDocument();

    // Advance past the poll interval to trigger re-read
    await act(async () => {
      await vi.advanceTimersByTimeAsync(600);
    });

    expect(screen.getByText("Externally Added Feature")).toBeInTheDocument();
  });
});
