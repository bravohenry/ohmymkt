/**
 * [INPUT]: ResolvedConfig, cycle output string from tool execution
 * [OUTPUT]: createDualTrackBalanceHook — after-hook warning on single-track drift
 * [POS]: Post-execution advisor, enforces dual-track (visibility + quality) balance
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import type { ResolvedConfig } from "../plugin-config";

/* ------------------------------------------------------------------ */
/*  Detection patterns                                                 */
/* ------------------------------------------------------------------ */

const SINGLE_TRACK_PATTERNS = [
  /visibility\s+rises?\s+while\s+quality\s+does\s+not/i,
  /insufficient\s+multi-track\s+progress/i,
  /decision:\s*intervene/i,
];

/* ------------------------------------------------------------------ */
/*  Hook factory                                                       */
/* ------------------------------------------------------------------ */

export function createDualTrackBalanceHook(_config: ResolvedConfig) {
  return {
    after: async (
      input: { tool: string; sessionID: string },
      output: { title: string; output: string; metadata: unknown },
    ) => {
      if (input.tool !== "ohmymkt_run_cycle") return;

      const drifted = SINGLE_TRACK_PATTERNS.some((re) => re.test(output.output));
      if (!drifted) return;

      output.output += `\n\n---\n[DUAL-TRACK WARNING] Single-track drift detected. `
        + `Visibility gains without quality improvement risk hollow growth. `
        + `Rebalance investment: increase quality-track allocation before next scale cycle.`;
    },
  };
}
