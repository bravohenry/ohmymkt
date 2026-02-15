/**
 * [INPUT]: Domain plans module (listPlans)
 * [OUTPUT]: createListPlansTool factory returning ohmymkt_list_plans tool
 * [POS]: Plan listing tool, shows all available growth plans
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import { tool } from "@opencode-ai/plugin/tool";
import type { ToolDefinition } from "@opencode-ai/plugin";
import type { ResolvedConfig } from "./config";
import { listPlans } from "./runtime/plans";

export function createListPlansTool(config: ResolvedConfig): ToolDefinition {
  return tool({
    description:
      "List all growth plans in the project. Returns plan file names and titles.",
    args: {},
    execute: async () => {
      const plans = listPlans(config.projectRoot);
      if (plans.length === 0) return "No plans found. Use ohmymkt_plan_growth to create one.";
      const lines = plans.map((p, i) => `${i + 1}. ${p.title} (${p.fileName})`);
      return `Plans (${plans.length}):\n${lines.join("\n")}`;
    },
  });
}
