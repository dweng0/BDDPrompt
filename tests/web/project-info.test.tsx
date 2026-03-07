// @vitest-environment happy-dom
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import App from "../../web/src/App";

const SAMPLE_BDD = `---
language: typescript
framework: react, vite
build_cmd: npm run build
test_cmd: npm test
lint_cmd: npm run lint
fmt_cmd: npm run format
birth_date: 2026-03-07
---

System: a tool for managing projects
`;

function mockFile(content: string) {
  const file = new File([content], "BDD.md", { type: "text/markdown" });
  const fileHandle = { getFile: () => Promise.resolve(file) };
  vi.stubGlobal("showOpenFilePicker", () => Promise.resolve([fileHandle]));
}

describe("frontmatter is displayed in the header when a file is loaded", () => {
  beforeEach(() => vi.unstubAllGlobals());

  it("shows language and framework in the header after opening a file", async () => {
    mockFile(SAMPLE_BDD);
    render(<App />);
    await act(async () => { fireEvent.click(screen.getByTestId("open-file-btn")); });
    expect(screen.getByTestId("header-language")).toHaveTextContent("typescript");
    expect(screen.getByTestId("header-framework")).toHaveTextContent("react, vite");
  });
});

describe("system description is displayed in the header when a file is loaded", () => {
  beforeEach(() => vi.unstubAllGlobals());

  it("shows system description in the header after opening a file", async () => {
    mockFile(SAMPLE_BDD);
    render(<App />);
    await act(async () => { fireEvent.click(screen.getByTestId("open-file-btn")); });
    expect(screen.getByTestId("header-system")).toHaveValue("a tool for managing projects");
  });
});

describe("user can edit the system description from the header", () => {
  beforeEach(() => vi.unstubAllGlobals());

  it("updates the document system description when edited in the header", async () => {
    mockFile(SAMPLE_BDD);
    render(<App />);
    await act(async () => { fireEvent.click(screen.getByTestId("open-file-btn")); });
    const input = screen.getByTestId("header-system");
    fireEvent.change(input, { target: { value: "an updated system description" } });
    expect(screen.getByTestId("header-system")).toHaveValue("an updated system description");
  });
});

describe("user can edit frontmatter fields from the header", () => {
  beforeEach(() => vi.unstubAllGlobals());

  it("updates language when edited in the header", async () => {
    mockFile(SAMPLE_BDD);
    render(<App />);
    await act(async () => { fireEvent.click(screen.getByTestId("open-file-btn")); });
    const input = screen.getByTestId("header-language-input");
    fireEvent.change(input, { target: { value: "python" } });
    expect(screen.getByTestId("header-language-input")).toHaveValue("python");
  });
});
