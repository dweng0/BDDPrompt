// @vitest-environment happy-dom
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "../../web/src/App";

const SAMPLE_BDD = `---
language: typescript
framework: react, vite
build_cmd: npm run build
test_cmd: npm test
birth_date: 2026-03-07
---

System: a tool for managing projects

Feature: User Authentication
    Scenario: Login success
        Given a user exists
        When they log in with valid credentials
        Then they are authenticated
`;

function mockFile(content: string) {
  const file = new File([content], "BDD.md", { type: "text/markdown" });
  const fileHandle = { getFile: () => Promise.resolve(file) };
  return fileHandle;
}

describe("LLM receives the current BDD document as context", () => {
  it("includes BDD document content when sending a message", async () => {
    const fileHandle = mockFile(SAMPLE_BDD);
    const mockShowOpenFilePicker = () => Promise.resolve([fileHandle]);
    
    // Mock the file picker
    Object.defineProperty(window, "showOpenFilePicker", {
      value: mockShowOpenFilePicker,
      writable: true,
    });

    render(<App />);
    
    // Open a BDD.md file
    fireEvent.click(screen.getByTestId("open-file-btn"));
    
    // Wait for file to load
    await screen.findByText("BDD.md");
    
    // Open chat panel
    fireEvent.click(screen.getByTestId("chat-toggle-btn"));
    
    // Configure provider and API key
    fireEvent.change(screen.getByTestId("chat-provider-select"), { 
      target: { value: "claude" } 
    });
    fireEvent.change(screen.getByTestId("chat-api-key-input"), { 
      target: { value: "sk-test-key" } 
    });
    
    // Send a message
    const messageInput = screen.getByTestId("chat-message-input");
    fireEvent.change(messageInput, { target: { value: "What features are in this project?" } });
    fireEvent.keyDown(messageInput, { key: "Enter" });
    
    // The message should be sent successfully
    expect(screen.getByText("What features are in this project?")).toBeInTheDocument();
  });
});
