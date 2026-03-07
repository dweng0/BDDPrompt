// @vitest-environment happy-dom
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import App from "../../web/src/App";

function makeAnthropicStream(text: string): ReadableStream {
  const encoder = new TextEncoder();
  const lines = [
    `event: content_block_delta\ndata: ${JSON.stringify({
      type: "content_block_delta",
      index: 0,
      delta: { type: "text_delta", text: text.slice(0, 5) },
    })}\n\n`,
    `event: content_block_delta\ndata: ${JSON.stringify({
      type: "content_block_delta",
      index: 0,
      delta: { type: "text_delta", text: text.slice(5) },
    })}\n\n`,
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

describe("user sends a message and receives a streaming response", () => {
  it("streams LLM response into the chat after sending a message", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      body: makeAnthropicStream("Hello from the LLM assistant!"),
    } as any);

    render(<App />);

    // Open chat panel
    fireEvent.click(screen.getByTestId("chat-toggle-btn"));

    // Configure provider and API key
    fireEvent.change(screen.getByTestId("chat-provider-select"), {
      target: { value: "claude" },
    });
    fireEvent.change(screen.getByTestId("chat-api-key-input"), {
      target: { value: "sk-ant-test" },
    });

    // Type and send a message
    const messageInput = screen.getByTestId("chat-message-input");
    fireEvent.change(messageInput, { target: { value: "Hello AI" } });
    fireEvent.keyDown(messageInput, { key: "Enter" });

    // User message should appear
    expect(screen.getByText("Hello AI")).toBeInTheDocument();

    // Streamed response should appear
    await waitFor(() => {
      expect(screen.getByText("Hello from the LLM assistant!")).toBeInTheDocument();
    });
  });
});

describe("chat history is maintained for the session", () => {
  it("shows previous messages in the chat history", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      body: makeAnthropicStream("Response 1"),
    } as any);

    render(<App />);

    // Open chat panel
    fireEvent.click(screen.getByTestId("chat-toggle-btn"));

    // Configure provider
    fireEvent.change(screen.getByTestId("chat-provider-select"), {
      target: { value: "claude" },
    });
    fireEvent.change(screen.getByTestId("chat-api-key-input"), {
      target: { value: "sk-ant-test" },
    });

    // Chat history container should exist
    expect(screen.getByTestId("chat-history")).toBeInTheDocument();

    // Send a message
    const messageInput = screen.getByTestId("chat-message-input");
    fireEvent.change(messageInput, { target: { value: "First message" } });
    fireEvent.keyDown(messageInput, { key: "Enter" });

    // Wait for response
    await waitFor(() => {
      expect(screen.getByText("First message")).toBeInTheDocument();
    });

    // History should contain prior messages
    expect(screen.getByText("First message")).toBeInTheDocument();
  });
});
