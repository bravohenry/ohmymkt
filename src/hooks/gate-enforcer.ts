/**
 * [INPUT]: evaluateCurrentGates from domain/gates, ResolvedConfig
 * [OUTPUT]: createGateEnforcerHook — before-hook blocking campaign start when gates fail
 * [POS]: Pre-execution guard, prevents scale actions until all 5 gates pass
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import type { ResolvedConfig } from "../plugin-config";
import { evaluateCurrentGates, formatGateReport } from "../domain/gates";

/* ------------------------------------------------------------------ */
/*  Hook factory                                                       */
/* ------------------------------------------------------------------ */

export function createGateEnforcerHook(config: ResolvedConfig) {
  return {
    before: async (
      input: { tool: string; sessionID: string },
      output: { args: Record<string, unknown> },
    ) => {
      if (input.tool !== "ohmymkt_start_campaign") return;

      const result = evaluateCurrentGates(
        config.projectRoot,
        config.templatePaths,
      );

      if (result.allPassed) return;

      const report = formatGateReport(result.evaluations);
      output.args.__gate_block =
        `[BLOCKED] Cannot start campaign — not all gates pass.\n\n${report}\n\nResolve failing gates before launching.`;
    },
  };
}
