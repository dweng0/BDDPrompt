import React from "react";

type ChatPanelProps = {
  isOpen: boolean;
};

export default function ChatPanel({ isOpen }: ChatPanelProps) {
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
          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-sm text-gray-400">Chat functionality coming soon...</p>
          </div>
        </>
      )}
    </aside>
  );
}
