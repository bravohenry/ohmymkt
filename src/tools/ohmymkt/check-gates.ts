/**
 * [INPUT]: Domain gates module (evaluateCurrentGates, formatGateReport)
 * [OUTPUT]: createCheckGatesTool factory returning ohmymkt_check_gates tool
 * [POS]: Gate evaluation tool, surfaces startup-gate pass/fail to the agent
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import { tool } from "@opencode-ai/plugin/tool";
import type { ToolDefinition } from "@opencode-ai/plugin";
import type { ResolvedConfig } from "./config";
import { evaluateCurrentGates, formatGateReport } from "./runtime/gates";

export function createCheckGatesTool(config: ResolvedConfig): ToolDefinition {
  return tool({
    description:
      "Evaluate all five startup gates (Strategy, Compliance, Capacity, Data, Ownership) and report pass/fail status. Run this before starting a campaign to verify readiness.",
    args: {},
    execute: async () => {
      const result = evaluateCurrentGates(config.projectRoot, config.templatePaths);
      const report = formatGateReport(result.evaluations);
      const overall = result.allPassed ? "ALL GATES PASSED" : "BLOCKED — one or more gates failed";
      return `${report}\n\nOverall: ${overall}`;
    },
  });
}
