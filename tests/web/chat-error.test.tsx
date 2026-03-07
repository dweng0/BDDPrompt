// @vitest-environment happy-dom
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import App from "../../web/src/App";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("invalid API key shows an error in the chat panel", () => {
  it("displays an error message when API key is invalid", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 401,
      json: () =>
        Promise.resolve({
          error: { message: "Invalid API key. Check your credentials." },
        }),
    } as any);

    render(<App />);

    // Open chat panel
    fireEvent.click(screen.getByTestId("chat-toggle-btn"));

    // Configure provider with an invalid API key
    fireEvent.change(screen.getByTestId("chat-provider-select"), {
      target: { value: "claude" },
    });
    fireEvent.change(screen.getByTestId("chat-api-key-input"), {
      target: { value: "invalid-key" },
    });

    // Send a message
    const messageInput = screen.getByTestId("chat-message-input");
    fireEvent.change(messageInput, { target: { value: "Hello" } });
    fireEvent.keyDown(messageInput, { key: "Enter" });

    // The user message should appear
    expect(screen.getByText("Hello")).toBeInTheDocument();

    // An error message should appear in the chat
    await waitFor(() => {
      expect(
        screen.getByText(/Error:.*Invalid API key/i)
      ).toBeInTheDocument();
    });
  });
});
