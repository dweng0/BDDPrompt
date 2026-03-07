import type { BddDocument, FeatureData, ScenarioData, Frontmatter } from "../types";

function parseFrontmatter(block: string): Frontmatter {
  const lines = block.trim().split("\n");
  const fm: Record<string, string> = {};
  for (const line of lines) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const val = line.slice(colon + 1).trim();
    fm[key] = val;
  }
  return {
    language: fm.language ?? "",
    framework: fm.framework ?? "",
    build_cmd: fm.build_cmd ?? "",
    test_cmd: fm.test_cmd ?? "",
    lint_cmd: fm.lint_cmd ?? "",
    fmt_cmd: fm.fmt_cmd ?? "",
    birth_date: fm.birth_date ?? "",
  };
}

export function parseBdd(text: string): BddDocument {
  // Split out frontmatter
  const fmMatch = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const frontmatterBlock = fmMatch ? fmMatch[1] : "";
  const body = fmMatch ? fmMatch[2] : text;
  const frontmatter = parseFrontmatter(frontmatterBlock);

  // Extract system description (first non-empty line before any Feature:)
  const systemMatch = body.match(/System:\s*(.+)/);
  const system_description = systemMatch ? systemMatch[1].trim() : "";

  // Parse features and scenarios
  const features: FeatureData[] = [];
  const featureBlocks = body.split(/^\s{4}Feature:/m).slice(1);

  for (const block of featureBlocks) {
    const lines = block.split("\n");
    const name = lines[0].trim();
    const scenarios: ScenarioData[] = [];

    const scenarioBlocks = block.split(/^\s{8}Scenario:/m).slice(1);
    for (const sb of scenarioBlocks) {
      const sbLines = sb.split("\n");
      const scenarioName = sbLines[0].trim();
      const given = (sb.match(/Given\s+(.+)/) ?? [])[1]?.trim() ?? "";
      const when = (sb.match(/When\s+(.+)/) ?? [])[1]?.trim() ?? "";
      const then = (sb.match(/Then\s+(.+)/) ?? [])[1]?.trim() ?? "";
      scenarios.push({ name: scenarioName, given, when, then });
    }

    features.push({ name, background: null, scenarios });
  }

  return { frontmatter, system_description, features };
}
