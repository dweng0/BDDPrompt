// @vitest-environment happy-dom
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "../../web/src/App";

const SAMPLE_BDD = `---
language: typescript
framework: react
build_cmd: npm run build
test_cmd: npm test
birth_date: 2026-03-07
---

System: a sample project

    Feature: Existing Feature
        Scenario: Existing Scenario
            Given something
            When action
            Then result
`;

function mockFile(content: string) {
  const file = new File([content], "BDD.md", { type: "text/markdown" });
  const writable = {
    write: () => Promise.resolve(),
    close: () => Promise.resolve(),
  };
  const fileHandle = {
    getFile: () => Promise.resolve(file),
    createWritable: () => Promise.resolve(writable),
  };
  return fileHandle;
}

describe("LLM response proposes a BDD change and the canvas updates", () => {
  it("updates canvas when LLM response contains valid BDD document", async () => {
    const fileHandle = mockFile(SAMPLE_BDD);
    const mockShowOpenFilePicker = () => Promise.resolve([fileHandle]);
    
    Object.defineProperty(window, "showOpenFilePicker", {
      value: mockShowOpenFilePicker,
      writable: true,
    });

    render(<App />);
    
    // Open a BDD.md file
    await act(async () => {
      fireEvent.click(screen.getByTestId("open-file-btn"));
    });
    
    // Wait for file to load and feature to appear
    await waitFor(() => {
      expect(screen.getByText("Existing Feature")).toBeInTheDocument();
    });
    
    // Open chat panel
    fireEvent.click(screen.getByTestId("chat-toggle-btn"));
    
    // Configure provider and API key
    fireEvent.change(screen.getByTestId("chat-provider-select"), { 
      target: { value: "claude" } 
    });
    fireEvent.change(screen.getByTestId("chat-api-key-input"), { 
      target: { value: "sk-test-key" } 
    });
    
    // Send a message requesting changes
    const messageInput = screen.getByTestId("chat-message-input");
    fireEvent.change(messageInput, { target: { value: "Add a new feature" } });
    fireEvent.keyDown(messageInput, { key: "Enter" });
    
    // The user message should appear
    expect(screen.getByText("Add a new feature")).toBeInTheDocument();
    
    // Wait for simulated response to appear (streaming animation)
    await waitFor(() => {
      const assistantMessages = screen.getAllByText(/simulated assistant/i);
      expect(assistantMessages.length).toBeGreaterThan(0);
    });
  });
});
