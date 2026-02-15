/**
 * [INPUT]: Domain research module (saveResearchBrief, readResearchBrief, listResearchBriefs, formatResearchBrief)
 * [OUTPUT]: createResearchBriefTool factory returning ohmymkt_research_brief tool
 * [POS]: Research brief CRUD tool for Vibe Flow Phase 1
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import { tool } from "@opencode-ai/plugin/tool";
import type { ToolDefinition } from "@opencode-ai/plugin";
import type { ResolvedConfig } from "../plugin-config";
import {
  saveResearchBrief,
  readResearchBrief,
  listResearchBriefs,
  formatResearchBrief,
  type ResearchFinding,
} from "../domain/research";

export function createResearchBriefTool(config: ResolvedConfig): ToolDefinition {
  return tool({
    description:
      "Create, read, or list research briefs. Use action='create' with title/objectives/competitors/findings/gaps to save a brief. Use action='read' with id to retrieve one. Use action='list' to see all brief IDs.",
    args: {
      action: tool.schema.enum(["create", "read", "list"]).describe("Action to perform"),
      id: tool.schema.string().optional().describe("Brief ID (for read)"),
      title: tool.schema.string().optional().describe("Brief title (for create)"),
      objectives: tool.schema.string().optional().describe("JSON array of objective strings (for create)"),
      competitors: tool.schema.string().optional().describe("JSON array of competitor strings (for create)"),
      findings: tool.schema.string().optional().describe("JSON array of {source,finding,relevance,action,category?,confidence?} objects (for create)"),
      gaps: tool.schema.string().optional().describe("JSON array of gap strings (for create)"),
    },
    execute: async (args) => {
      const action = args.action;

      if (action === "list") {
        const ids = listResearchBriefs(config.projectRoot);
        return ids.length > 0
          ? `Research briefs:\n${ids.map((id) => `- ${id}`).join("\n")}`
          : "No research briefs found.";
      }

      if (action === "read") {
        const id = args.id ?? "";
        if (!id) return "Error: id is required for read action.";
        const brief = readResearchBrief(config.projectRoot, id);
        if (!brief) return `No brief found with id: ${id}`;
        return formatResearchBrief(brief);
      }

      if (action === "create") {
        const title = args.title ?? "Untitled Research";
        const objectives = JSON.parse(args.objectives ?? "[]") as string[];
        const competitors = JSON.parse(args.competitors ?? "[]") as string[];
        const findings = JSON.parse(args.findings ?? "[]") as ResearchFinding[];
        const gaps = JSON.parse(args.gaps ?? "[]") as string[];
        const brief = saveResearchBrief(config.projectRoot, { title, objectives, competitors, findings, gaps });
        return `Research brief saved.\n\n${formatResearchBrief(brief)}`;
      }

      return `Unknown action: ${action}. Use create, read, or list.`;
    },
  });
}
