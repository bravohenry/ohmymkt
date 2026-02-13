/**
 * [INPUT]: Domain plans module (createPlan)
 * [OUTPUT]: createPlanGrowthTool factory returning ohmymkt_plan_growth tool
 * [POS]: Plan creation tool, captures a structured growth plan from agent input
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import { tool } from "@opencode-ai/plugin/tool";
import type { ToolDefinition } from "@opencode-ai/plugin";
import type { ResolvedConfig } from "../plugin-config";
import { createPlan } from "../domain/plans";

export function createPlanGrowthTool(config: ResolvedConfig): ToolDefinition {
  return tool({
    description:
      "Create a new growth plan with a stated goal. The plan includes startup gates, role assignments, dual-track execution checklist, and cycle cadence. Optionally provide a custom name.",
    args: {
      goal: tool.schema.string().describe("The business goal this growth plan targets"),
      name: tool.schema.string().optional().describe("Optional custom plan name (slug-safe)"),
    },
    execute: async (args) => {
      const result = createPlan(config.projectRoot, args.goal, args.name);
      return `Plan created: ${result.name}\nFile: ${result.filePath}`;
    },
  });
}
