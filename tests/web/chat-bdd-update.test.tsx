// @vitest-environment happy-dom
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
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

const BDD_WITH_NEW_FEATURE = `---
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

    Feature: New AI Feature
        Scenario: AI Scenario
            Given the AI works
            When it proposes changes
            Then the canvas updates
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

function makeAnthropicStream(text: string): ReadableStream {
  const encoder = new TextEncoder();
  const lines = [
    `event: content_block_delta\ndata: ${JSON.stringify({ type: "content_block_delta", index: 0, delta: { type: "text_delta", text } })}\n\n`,
    `event: message_stop\ndata: ${JSON.stringify({ type: "message_stop" })}\n\n`,
  ];
  return new ReadableStream({
    start(controller) {
      for (const line of lines) {
        controller.enqueue(encoder.encode(line));
      }
      controller.close();
    },
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("LLM response proposes a BDD change and the canvas updates", () => {
  it("updates canvas when LLM response contains valid BDD document", async () => {
    const fileHandle = mockFile(SAMPLE_BDD);
    Object.defineProperty(window, "showOpenFilePicker", {
      value: () => Promise.resolve([fileHandle]),
      writable: true,
    });

    const responseText = `Here is the updated BDD document:\n\`\`\`bdd\n${BDD_WITH_NEW_FEATURE}\`\`\``;
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      body: makeAnthropicStream(responseText),
    } as any);

    render(<App />);

    // Open a BDD.md file
    await act(async () => {
      fireEvent.click(screen.getByTestId("open-file-btn"));
    });

    // Wait for file to load
    await waitFor(() => {
      expect(screen.getByText("Existing Feature")).toBeInTheDocument();
    });

    // Open chat panel
    fireEvent.click(screen.getByTestId("chat-toggle-btn"));

    // Configure provider and API key
    fireEvent.change(screen.getByTestId("chat-provider-select"), {
      target: { value: "claude" },
    });
    fireEvent.change(screen.getByTestId("chat-api-key-input"), {
      target: { value: "sk-ant-test" },
    });

    // Send a message requesting changes
    const messageInput = screen.getByTestId("chat-message-input");
    fireEvent.change(messageInput, { target: { value: "Add a new feature" } });
    fireEvent.keyDown(messageInput, { key: "Enter" });

    // The user message should appear
    expect(screen.getByText("Add a new feature")).toBeInTheDocument();

    // Wait for the LLM response to be processed and canvas to update
    await waitFor(() => {
      expect(screen.getByText("New AI Feature")).toBeInTheDocument();
    });
  });
});
