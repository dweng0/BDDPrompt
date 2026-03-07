import React, { useState } from "react";

type ChatPanelProps = {
  isOpen: boolean;
};

type Provider = "claude" | "openai";

export default function ChatPanel({ isOpen }: ChatPanelProps) {
  const [provider, setProvider] = useState<Provider>("claude");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");

  const isConfigured = provider && apiKey.length > 0;

  return (
    <aside
      data-testid="chat-panel"
      className={`
        shrink-0 bg-gray-900 text-white flex flex-col border-l border-gray-700
        transition-all duration-300 ease-in-out overflow-hidden
        ${isOpen ? "w-80 translate-x-0" : "w-0 translate-x-full opacity-0"}
      `}
    >
      {isOpen && (
        <>
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
            <h3 className="font-semibold text-sm">AI Assistant</h3>
          </div>

          {/* Configuration Section */}
          <div className="p-4 border-b border-gray-700 space-y-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Provider</label>
              <select
                data-testid="chat-provider-select"
                value={provider}
                onChange={(e) => setProvider(e.target.value as Provider)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="claude">Claude</option>
                <option value="openai">OpenAI-compatible</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">API Key</label>
              <input
                data-testid="chat-api-key-input"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            {provider === "openai" && (
              <div>
                <label className="text-xs text-gray-400 block mb-1">Base URL (optional)</label>
                <input
                  data-testid="chat-base-url-input"
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4">
            {!isConfigured ? (
              <p className="text-sm text-gray-400">
                Configure a provider and API key to start chatting
              </p>
            ) : (
              <p className="text-sm text-gray-400">Chat ready. Start typing...</p>
            )}
          </div>

          {/* Message Input */}
          <div className="p-3 border-t border-gray-700">
            <input
              data-testid="chat-message-input"
              type="text"
              disabled={!isConfigured}
              placeholder={isConfigured ? "Type a message..." : "Configure API key first"}
              className={`
                w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm
                focus:outline-none focus:border-purple-500
                ${!isConfigured ? "opacity-50 cursor-not-allowed" : ""}
              `}
            />
          </div>
        </>
      )}
    </aside>
  );
}
