import React, { useState, useRef, useEffect } from "react";

type ChatPanelProps = {
  isOpen: boolean;
};

type Provider = "claude" | "openai";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function ChatPanel({ isOpen }: ChatPanelProps) {
  const [provider, setProvider] = useState<Provider>("claude");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isConfigured = provider && apiKey.length > 0;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || !isConfigured) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate streaming response
    const responseId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: responseId, role: "assistant", content: "" },
    ]);

    const responseText = "I'm a simulated assistant response. Streaming functionality will be implemented with real API integration.";
    let charIndex = 0;

    const streamInterval = setInterval(() => {
      if (charIndex >= responseText.length) {
        clearInterval(streamInterval);
        return;
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === responseId
            ? { ...msg, content: responseText.slice(0, charIndex + 1) }
            : msg
        )
      );
      charIndex++;
    }, 20);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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

          {/* Chat History */}
          <div data-testid="chat-history" className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <p className="text-sm text-gray-400">
                {isConfigured
                  ? "Chat ready. Start typing..."
                  : "Configure a provider and API key to start chatting"}
              </p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-800 text-gray-200"
                    }`}
                  >
                    {msg.content}
                    {msg.role === "assistant" && msg.content.length > 0 && (
                      <span className="inline-block w-2 h-4 ml-0.5 bg-purple-400 animate-pulse" />
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-3 border-t border-gray-700">
            <input
              data-testid="chat-message-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
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
