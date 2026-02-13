/**
 * [INPUT]: Domain cycle module (runCycle)
 * [OUTPUT]: createRunCycleTool factory returning ohmymkt_run_cycle tool
 * [POS]: Cadence execution tool, runs weekly/monthly/quarterly operational review
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import { tool } from "@opencode-ai/plugin/tool";
import type { ToolDefinition } from "@opencode-ai/plugin";
import type { ResolvedConfig } from "../plugin-config";
import { runCycle } from "../domain/cycle";

export function createRunCycleTool(config: ResolvedConfig): ToolDefinition {
  return tool({
    description:
      "Run an operational review cycle at the specified cadence. Evaluates gates, metrics, and incidents to produce a continue/intervene/rollback decision with recommended actions.",
    args: {
      cadence: tool.schema.enum(["weekly", "monthly", "quarterly"]).describe("Cycle cadence to execute"),
    },
    execute: async (args) => {
      const result = runCycle(config.projectRoot, args.cadence, config.templatePaths);
      return [
        `Decision: ${result.decision}`,
        `Reason: ${result.reason}`,
        "",
        "Actions:",
        ...result.actions.map((a) => `- ${a}`),
        "",
        `Report: ${result.reportFile}`,
      ].join("\n");
    },
  });
}
