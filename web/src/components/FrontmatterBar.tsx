import React from "react";
import type { BddDocument } from "../types";

type Props = {
  doc: BddDocument;
  onUpdateFrontmatter: (patch: Partial<BddDocument["frontmatter"]>) => void;
  onUpdateSystem: (value: string) => void;
};

function Tag({ label, value, testId, onChange }: {
  label: string;
  value: string;
  testId?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 bg-gray-800 rounded px-2 py-1 min-w-0">
      <span className="text-gray-500 text-xs shrink-0">{label}</span>
      <input
        data-testid={testId}
        className="bg-transparent text-gray-200 text-xs w-24 focus:outline-none focus:text-white min-w-0"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={!onChange}
      />
    </div>
  );
}

export default function FrontmatterBar({ doc, onUpdateFrontmatter, onUpdateSystem }: Props) {
  const { frontmatter, system_description } = doc;

  return (
    <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-850 border-t border-gray-700 overflow-x-auto bg-gray-800">
      {/* System description */}
      <span className="text-gray-500 text-xs shrink-0">System:</span>
      <input
        data-testid="header-system"
        className="bg-transparent text-gray-200 text-xs flex-1 min-w-48 focus:outline-none focus:text-white placeholder-gray-600"
        value={system_description}
        onChange={(e) => onUpdateSystem(e.target.value)}
        placeholder="Describe the system…"
      />

      <div className="w-px h-4 bg-gray-700 shrink-0" />

      {/* Frontmatter chips */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span data-testid="header-language" className="hidden">{frontmatter.language}</span>
        <span data-testid="header-framework" className="hidden">{frontmatter.framework}</span>
        <Tag label="lang" value={frontmatter.language} testId="header-language-input" onChange={(v) => onUpdateFrontmatter({ language: v })} />
        <Tag label="framework" value={frontmatter.framework} testId="header-framework-input" onChange={(v) => onUpdateFrontmatter({ framework: v })} />
        <Tag label="build" value={frontmatter.build_cmd} onChange={(v) => onUpdateFrontmatter({ build_cmd: v })} />
        <Tag label="test" value={frontmatter.test_cmd} onChange={(v) => onUpdateFrontmatter({ test_cmd: v })} />
      </div>
    </div>
  );
}
