// @vitest-environment happy-dom
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import App from "../../web/src/App";

// Mock PeerJS so it works in happy-dom without a real signaling server
vi.mock("peerjs", () => {
  class MockPeer {
    id: string;
    private listeners: Record<string, ((...args: any[]) => void)[]> = {};

    constructor(id?: string) {
      this.id = id ?? "MOCK01";
      // Simulate async connection to signaling server
      Promise.resolve().then(() => {
        this._emit("open", this.id);
      });
    }

    on(event: string, cb: (...args: any[]) => void) {
      if (!this.listeners[event]) this.listeners[event] = [];
      this.listeners[event].push(cb);
      return this;
    }

    _emit(event: string, ...args: any[]) {
      (this.listeners[event] ?? []).forEach((cb) => cb(...args));
    }

    connect(_peerId: string) {
      const connListeners: Record<string, ((...args: any[]) => void)[]> = {};
      const conn = {
        peer: _peerId,
        on(event: string, cb: (...args: any[]) => void) {
          if (!connListeners[event]) connListeners[event] = [];
          connListeners[event].push(cb);
          if (event === "open") {
            Promise.resolve().then(() => cb());
          }
          return this;
        },
        send: vi.fn(),
        close: vi.fn(),
      };
      return conn;
    }

    destroy() {}
  }

  return { default: MockPeer };
});

const SAMPLE_BDD = `---
language: typescript
framework: react
build_cmd: npm run build
test_cmd: npm test
birth_date: 2026-03-07
---

System: a sample project

    Feature: Test Feature
        Scenario: Test Scenario
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

afterEach(() => {
  vi.restoreAllMocks();
});

describe("host creates a collaboration session and receives a share code", () => {
  it("displays a share code when starting a collaboration session", async () => {
    const fileHandle = mockFile(SAMPLE_BDD);
    Object.defineProperty(window, "showOpenFilePicker", {
      value: () => Promise.resolve([fileHandle]),
      writable: true,
    });

    render(<App />);

    // Open a BDD.md file first
    await act(async () => {
      fireEvent.click(screen.getByTestId("open-file-btn"));
    });

    // Wait for file to load
    await waitFor(() => {
      expect(screen.getByText("BDD.md")).toBeInTheDocument();
    });

    // Click Share button to start collaboration session
    await act(async () => {
      fireEvent.click(screen.getByTestId("share-btn"));
    });

    // A share code should be displayed (the mock Peer uses the id we passed)
    await waitFor(() => {
      const shareCode = screen.getByTestId("share-code");
      expect(shareCode).toBeInTheDocument();
      // The code matches the generated 6-char pattern or the mock fallback
      expect(shareCode.textContent).toMatch(/^[A-Z0-9]{6}$/);
    });
  });
});

describe("guest joins a session using a share code", () => {
  it("allows entering a share code to join a session", async () => {
    render(<App />);

    // Click Join button
    fireEvent.click(screen.getByTestId("join-btn"));

    // A join dialog should appear with input for share code
    const shareCodeInput = screen.getByTestId("join-share-code-input");
    expect(shareCodeInput).toBeInTheDocument();

    // Enter a share code
    fireEvent.change(shareCodeInput, { target: { value: "ABC123" } });
    expect(shareCodeInput).toHaveValue("ABC123");
  });
});
