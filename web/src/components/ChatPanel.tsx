import React, { useState, useRef, useEffect } from "react";
import { parseBdd } from "../utils/bddParser";
import { generateBddContent } from "../utils/bddWriter";
import type { BddDocument } from "../types";

type ChatPanelProps = {
  isOpen: boolean;
  doc: BddDocument | null;
  onDocUpdate: (doc: BddDocument) => void;
};

type Provider = "claude" | "openai";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  error?: boolean;
};

function buildSystemPrompt(doc: BddDocument | null): string {
  const base =
    "You are an AI assistant helping with BDD specification files. " +
    "When proposing changes to the BDD document, wrap your updated BDD document in a ```bdd code block.";
  if (!doc) return base;
  const bddText = generateBddContent(doc);
  return `${base}\n\nThe current BDD document is:\n<bdd>\n${bddText}\n</bdd>`;
}

async function* streamAnthropic(
  apiKey: string,
  systemPrompt: string,
  messages: { role: string; content: string }[]
): AsyncGenerator<string, void, unknown> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-opus-4-6",
      max_tokens: 4096,
      stream: true,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(err?.error?.message ?? `HTTP ${response.status}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        try {
          const json = JSON.parse(data);
          if (json.type === "content_block_delta" && json.delta?.type === "text_delta") {
            yield json.delta.text;
          }
        } catch {}
      }
    }
  }
}

async function* streamOpenAI(
  apiKey: string,
  baseUrl: string,
  model: string,
  systemPrompt: string,
  messages: { role: string; content: string }[]
): AsyncGenerator<string, void, unknown> {
  const url = `${baseUrl || "https://api.openai.com/v1"}/chat/completions`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: model || "gpt-4",
      stream: true,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(err?.error?.message ?? `HTTP ${response.status}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (line.startsWith("data: ") && line !== "data: [DONE]") {
        const data = line.slice(6);
        try {
          const json = JSON.parse(data);
          const text = json.choices?.[0]?.delta?.content;
          if (text) yield text;
        } catch {}
      }
    }
  }
}

function extractBddBlock(text: string): string | null {
  const match = text.match(/```bdd\n([\s\S]*?)```/);
  return match ? match[1] : null;
}

const LS_KEY = "bddprompt-chat-config";

function loadConfig() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as { provider: Provider; apiKey: string; baseUrl: string; model: string };
  } catch {
    return null;
  }
}

function saveConfig(provider: Provider, apiKey: string, baseUrl: string, model: string) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ provider, apiKey, baseUrl, model }));
  } catch {}
}

export default function ChatPanel({ isOpen, doc, onDocUpdate }: ChatPanelProps) {
  const saved = loadConfig();
  const [provider, setProvider] = useState<Provider>(saved?.provider ?? "claude");
  const [apiKey, setApiKey] = useState(saved?.apiKey ?? "");
  const [baseUrl, setBaseUrl] = useState(saved?.baseUrl ?? "");
  const [model, setModel] = useState(saved?.model ?? "");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const isConfigured = provider && apiKey.length > 0;

  useEffect(() => {
    saveConfig(provider, apiKey, baseUrl, model);
  }, [provider, apiKey, baseUrl, model]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !isConfigured || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
    };

    const history = [...messages, userMessage];
    setMessages(history);
    setInputValue("");
    setIsLoading(true);

    const responseId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: responseId, role: "assistant", content: "" }]);

    const conversationMessages = history.map((m) => ({ role: m.role, content: m.content }));
    const systemPrompt = buildSystemPrompt(doc);

    try {
      const stream =
        provider === "claude"
          ? streamAnthropic(apiKey, systemPrompt, conversationMessages)
          : streamOpenAI(apiKey, baseUrl, model, systemPrompt, conversationMessages);

      let fullText = "";
      for await (const chunk of stream) {
        fullText += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === responseId ? { ...msg, content: fullText } : msg
          )
        );
      }

      // Check if the response proposes a BDD update
      const bddBlock = extractBddBlock(fullText);
      if (bddBlock) {
        try {
          const updatedDoc = parseBdd(bddBlock);
          onDocUpdate(updatedDoc);
        } catch {}
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === responseId
            ? { ...msg, content: `Error: ${errorMsg}`, error: true }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
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
              <>
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
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Model</label>
                  <input
                    data-testid="chat-model-input"
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="gpt-4"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Model names may be case-sensitive</p>
                </div>
              </>
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
                      msg.error
                        ? "bg-red-900 text-red-200"
                        : msg.role === "user"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-800 text-gray-200"
                    }`}
                  >
                    {msg.content}
                    {msg.role === "assistant" && !msg.error && isLoading && msg.content.length > 0 && (
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
              disabled={!isConfigured || isLoading}
              placeholder={isConfigured ? "Type a message..." : "Configure API key first"}
              className={`
                w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm
                focus:outline-none focus:border-purple-500
                ${!isConfigured || isLoading ? "opacity-50 cursor-not-allowed" : ""}
              `}
            />
          </div>
        </>
      )}
    </aside>
  );
}
