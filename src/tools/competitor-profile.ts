/**
 * [INPUT]: Domain research module (saveCompetitorProfile, readCompetitorProfile, listCompetitorProfiles, formatCompetitorProfile, formatCompetitorBattlecard)
 * [OUTPUT]: createCompetitorProfileTool factory returning ohmymkt_competitor_profile tool
 * [POS]: Competitor intelligence CRUD tool for Vibe Flow Phase 1
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import { tool } from "@opencode-ai/plugin/tool";
import type { ToolDefinition } from "@opencode-ai/plugin";
import type { ResolvedConfig } from "../plugin-config";
import {
  saveCompetitorProfile,
  readCompetitorProfile,
  listCompetitorProfiles,
  formatCompetitorProfile,
  formatCompetitorBattlecard,
} from "../domain/research";

export function createCompetitorProfileTool(config: ResolvedConfig): ToolDefinition {
  return tool({
    description:
      "Manage competitor profiles. Use action='save' to create/update a competitor profile. Use action='read' with id to retrieve one. Use action='list' to see all. Use action='battlecard' with id for a compact battle card.",
    args: {
      action: tool.schema.enum(["save", "read", "list", "battlecard"]).describe("Action to perform"),
      id: tool.schema.string().optional().describe("Competitor ID (for read/battlecard)"),
      name: tool.schema.string().optional().describe("Competitor name (for save)"),
      url: tool.schema.string().optional().describe("Competitor URL (for save)"),
      positioning: tool.schema.string().optional().describe("One-line positioning statement (for save)"),
      pricing: tool.schema.string().optional().describe("Pricing model description (for save)"),
      strengths: tool.schema.string().optional().describe("JSON array of strength strings (for save)"),
      weaknesses: tool.schema.string().optional().describe("JSON array of weakness strings (for save)"),
      features: tool.schema.string().optional().describe("JSON array of core feature strings (for save)"),
      target_audience: tool.schema.string().optional().describe("Target audience description (for save)"),
      differentiators: tool.schema.string().optional().describe("JSON array of claimed differentiators (for save)"),
      threats: tool.schema.string().optional().describe("JSON array of threats to us (for save)"),
      opportunities: tool.schema.string().optional().describe("JSON array of opportunities from their weaknesses (for save)"),
    },
    execute: async (args) => {
      const action = args.action;

      if (action === "list") {
        const ids = listCompetitorProfiles(config.projectRoot);
        return ids.length > 0
          ? `Competitor profiles:\n${ids.map((id) => `- ${id}`).join("\n")}`
          : "No competitor profiles found.";
      }

      if (action === "read") {
        const id = args.id ?? "";
        if (!id) return "Error: id is required for read action.";
        const profile = readCompetitorProfile(config.projectRoot, id);
        if (!profile) return `No competitor profile found with id: ${id}`;
        return formatCompetitorProfile(profile);
      }

      if (action === "battlecard") {
        const id = args.id ?? "";
        if (!id) return "Error: id is required for battlecard action.";
        const profile = readCompetitorProfile(config.projectRoot, id);
        if (!profile) return `No competitor profile found with id: ${id}`;
        return formatCompetitorBattlecard(profile);
      }

      if (action === "save") {
        const name = args.name ?? "";
        if (!name) return "Error: name is required for save action.";
        const positioning = args.positioning ?? "";
        if (!positioning) return "Error: positioning is required for save action.";
        const profile = saveCompetitorProfile(config.projectRoot, {
          name,
          url: args.url,
          positioning,
          pricing: args.pricing,
          strengths: JSON.parse(args.strengths ?? "[]") as string[],
          weaknesses: JSON.parse(args.weaknesses ?? "[]") as string[],
          features: args.features ? (JSON.parse(args.features) as string[]) : undefined,
          target_audience: args.target_audience,
          differentiators: args.differentiators ? (JSON.parse(args.differentiators) as string[]) : undefined,
          threats: args.threats ? (JSON.parse(args.threats) as string[]) : undefined,
          opportunities: args.opportunities ? (JSON.parse(args.opportunities) as string[]) : undefined,
        });
        return `Competitor profile saved.\n\n${formatCompetitorProfile(profile)}`;
      }

      return `Unknown action: ${action}. Use save, read, list, or battlecard.`;
    },
  });
}
