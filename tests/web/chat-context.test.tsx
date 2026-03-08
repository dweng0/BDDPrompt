// @vitest-environment happy-dom
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
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
  const fileHandle = {
    getFile: () => Promise.resolve(file),
    createWritable: () =>
      Promise.resolve({
        write: () => Promise.resolve(),
        close: () => Promise.resolve(),
      }),
  };
  return fileHandle;
}

function makeAnthropicStream(text: string): ReadableStream {
  const encoder = new TextEncoder();
  const line = `event: content_block_delta\ndata: ${JSON.stringify({
    type: "content_block_delta",
    index: 0,
    delta: { type: "text_delta", text },
  })}\n\n`;
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(line));
      controller.close();
    },
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("LLM receives the current BDD document as context", () => {
  it("includes BDD document content in the system prompt when sending a message", async () => {
    const fileHandle = mockFile(SAMPLE_BDD);
    Object.defineProperty(window, "showOpenFilePicker", {
      value: () => Promise.resolve([fileHandle]),
      writable: true,
    });

    let capturedBody: Record<string, unknown> | null = null;
    vi.spyOn(globalThis, "fetch").mockImplementation(async (_url, init) => {
      const body = init?.body as string;
      capturedBody = JSON.parse(body);
      return {
        ok: true,
        body: makeAnthropicStream("Got your message!"),
      } satisfies Response;
    });

    render(<App />);

    // Open a BDD.md file
    await act(async () => {
      fireEvent.click(screen.getByTestId("open-file-btn"));
    });

    // Wait for file to load
    await screen.findByText("BDD.md");

    // Open chat panel
    fireEvent.click(screen.getByTestId("chat-toggle-btn"));

    // Configure provider and API key
    fireEvent.change(screen.getByTestId("chat-provider-select"), {
      target: { value: "claude" },
    });
    fireEvent.change(screen.getByTestId("chat-api-key-input"), {
      target: { value: "sk-ant-test" },
    });

    // Send a message
    const messageInput = screen.getByTestId("chat-message-input");
    fireEvent.change(messageInput, {
      target: { value: "What features are in this project?" },
    });
    fireEvent.keyDown(messageInput, { key: "Enter" });

    // The message should appear in chat
    expect(
      screen.getByText("What features are in this project?"),
    ).toBeInTheDocument();

    // Wait for fetch to be called
    await waitFor(() => {
      expect(capturedBody).not.toBeNull();
    });

    // The system prompt should include the BDD document content
    expect(capturedBody.system).toContain("User Authentication");
    expect(capturedBody.system).toContain("a tool for managing projects");
  });
});
