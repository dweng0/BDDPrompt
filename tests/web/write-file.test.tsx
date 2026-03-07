// @vitest-environment happy-dom
// coverage: canvas writes bddmd when changes are made
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
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
`;

function mockWritableFileSystem(content: string) {
  const written: string[] = [];
  const writable = {
    write: vi.fn((data: string) => { written.push(data); return Promise.resolve(); }),
    close: vi.fn(() => Promise.resolve()),
  };
  const file = new File([content], "BDD.md", { type: "text/markdown" });
  const fileHandle = {
    getFile: () => Promise.resolve(file),
    createWritable: vi.fn(() => Promise.resolve(writable)),
  };
  vi.stubGlobal("showOpenFilePicker", () => Promise.resolve([fileHandle]));
  return { fileHandle, writable, written };
}

describe("canvas writes BDD.md when changes are made", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("BDD.md file is updated when user drags a feature onto the canvas", async () => {
    const { writable } = mockWritableFileSystem(SAMPLE_BDD);
    render(<App />);

    // Open the file
    await act(async () => {
      fireEvent.click(screen.getByTestId("open-file-btn"));
    });

    // Drop a feature onto the canvas
    const transfer = {
      dataTransfer: {
        setData: vi.fn(),
        getData: vi.fn().mockReturnValue("feature"),
      },
    };
    await act(async () => {
      fireEvent.dragStart(screen.getByTestId("palette-feature"), transfer);
      fireEvent.dragOver(screen.getByTestId("canvas"), transfer);
      fireEvent.drop(screen.getByTestId("canvas"), transfer);
    });

    expect(writable.write).toHaveBeenCalled();
    const written = writable.write.mock.calls[0][0] as string;
    expect(written).toContain("Feature:");
  });
});
