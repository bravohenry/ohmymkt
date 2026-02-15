/**
 * [INPUT]: Domain campaign module (startCampaign), domain gates (formatGateReport)
 * [OUTPUT]: createStartCampaignTool factory returning ohmymkt_start_campaign tool
 * [POS]: Campaign launcher tool, transitions from planning to execution mode
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import { tool } from "@opencode-ai/plugin/tool";
import type { ToolDefinition } from "@opencode-ai/plugin";
import type { ResolvedConfig } from "./config";
import { startCampaign } from "./runtime/campaign";
import { formatGateReport } from "./runtime/gates";

export function createStartCampaignTool(config: ResolvedConfig): ToolDefinition {
  return tool({
    description:
      "Start a growth campaign. Verifies all startup gates pass, resolves a plan, initializes sprint board, notepads, and execution state. Optionally specify which plan to use.",
    args: {
      plan: tool.schema.string().optional().describe("Plan name or hint to resolve (defaults to latest plan)"),
    },
    execute: async (args) => {
      const result = startCampaign(config.projectRoot, args.plan, config.templatePaths);
      if (!result.ok) {
        const gateReport = formatGateReport(result.gateResult.evaluations);
        return `Campaign blocked: ${result.reason}\n\n${gateReport}`;
      }
      return [
        `Campaign started for plan: ${result.plan.title}`,
        `Sprint board: ${result.sprintSize} tasks loaded`,
        `Notepads: ${result.notepads.planNotepadDir}`,
        `Boulder role: ${result.boulder.role}`,
      ].join("\n");
    },
  });
}
