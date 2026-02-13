/**
 * [INPUT]: Domain research module (savePositioning, readPositioning, formatPositioning)
 * [OUTPUT]: createSavePositioningTool factory returning ohmymkt_save_positioning tool
 * [POS]: Positioning angle storage tool for Vibe Flow Phase 2
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import { tool } from "@opencode-ai/plugin/tool";
import type { ToolDefinition } from "@opencode-ai/plugin";
import type { ResolvedConfig } from "../plugin-config";
import {
  savePositioning,
  readPositioning,
  formatPositioning,
} from "../domain/research";

export function createSavePositioningTool(config: ResolvedConfig): ToolDefinition {
  return tool({
    description:
      "Save or read positioning angles. Use action='save' with name/statement/headline/proof_points/risks/score/selected/rationale to store an angle. Use action='read' to list all saved angles.",
    args: {
      action: tool.schema.enum(["save", "read"]).describe("Action to perform"),
      name: tool.schema.string().optional().describe("Angle name (for save)"),
      statement: tool.schema.string().optional().describe("Positioning statement (for save)"),
      headline: tool.schema.string().optional().describe("Homepage headline (for save)"),
      proof_points: tool.schema.string().optional().describe("JSON array of proof point strings (for save)"),
      risks: tool.schema.string().optional().describe("JSON array of risk strings (for save)"),
      score: tool.schema.string().optional().describe("JSON object of criterion:score pairs (for save)"),
      selected: tool.schema.string().optional().describe("true/false — whether this is the selected angle (for save)"),
      rationale: tool.schema.string().optional().describe("Why this angle was chosen (for save)"),
    },
    execute: async (args) => {
      const action = args.action;

      if (action === "read") {
        const angles = readPositioning(config.projectRoot);
        return formatPositioning(angles);
      }

      if (action === "save") {
        const name = args.name ?? "Untitled Angle";
        const statement = args.statement ?? "";
        const headline = args.headline ?? "";
        const proof_points = JSON.parse(args.proof_points ?? "[]") as string[];
        const risks = JSON.parse(args.risks ?? "[]") as string[];
        const score = JSON.parse(args.score ?? "{}") as Record<string, number>;
        const selected = args.selected === "true";
        const rationale = args.rationale ?? "";
        const angle = savePositioning(config.projectRoot, {
          name, statement, headline, proof_points, risks, score, selected, rationale,
        });
        return `Positioning angle saved: ${angle.name}${angle.selected ? " (SELECTED)" : ""}\n\n${formatPositioning(readPositioning(config.projectRoot))}`;
      }

      return `Unknown action: ${action}. Use save or read.`;
    },
  });
}
