// @vitest-environment happy-dom
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "../../web/src/App";

describe("user configures an LLM provider with an API key", () => {
  it("activates chat input when provider and API key are configured", async () => {
    render(<App />);

    // Open chat panel
    fireEvent.click(screen.getByTestId("chat-toggle-btn"));

    // Select a provider (Claude)
    const providerSelect = screen.getByTestId("chat-provider-select");
    fireEvent.change(providerSelect, { target: { value: "claude" } });

    // Enter API key
    const apiKeyInput = screen.getByTestId("chat-api-key-input");
    fireEvent.change(apiKeyInput, { target: { value: "sk-test-key" } });

    // Chat input should become active
    const chatInput = screen.getByTestId("chat-message-input");
    expect(chatInput).not.toBeDisabled();
  });

  it("allows selecting OpenAI-compatible provider", async () => {
    render(<App />);

    // Open chat panel
    fireEvent.click(screen.getByTestId("chat-toggle-btn"));

    // Select OpenAI-compatible provider
    const providerSelect = screen.getByTestId("chat-provider-select");
    fireEvent.change(providerSelect, { target: { value: "openai" } });

    expect(providerSelect).toHaveValue("openai");
  });
});

describe("user can set a custom OpenAI-compatible base URL", () => {
  it("shows base URL input when OpenAI-compatible is selected", async () => {
    render(<App />);

    // Open chat panel
    fireEvent.click(screen.getByTestId("chat-toggle-btn"));

    // Select OpenAI-compatible provider
    const providerSelect = screen.getByTestId("chat-provider-select");
    fireEvent.change(providerSelect, { target: { value: "openai" } });

    // Base URL input should appear
    const baseUrlInput = screen.getByTestId("chat-base-url-input");
    expect(baseUrlInput).toBeInTheDocument();

    // Set custom base URL
    fireEvent.change(baseUrlInput, {
      target: { value: "https://api.example.com/v1" },
    });
    expect(baseUrlInput).toHaveValue("https://api.example.com/v1");
  });
});
