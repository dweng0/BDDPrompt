// @vitest-environment happy-dom
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "../../web/src/App";

describe("user opens the chat panel", () => {
  it("opens a chat panel when the chat button is clicked", () => {
    render(<App />);
    const chatButton = screen.getByTestId("chat-toggle-btn");
    fireEvent.click(chatButton);
    expect(screen.getByTestId("chat-panel")).toBeInTheDocument();
  });

  it("chat panel slides open alongside the canvas", () => {
    render(<App />);
    const chatButton = screen.getByTestId("chat-toggle-btn");
    fireEvent.click(chatButton);
    const chatPanel = screen.getByTestId("chat-panel");
    expect(chatPanel).toHaveClass("translate-x-0");
  });
});
