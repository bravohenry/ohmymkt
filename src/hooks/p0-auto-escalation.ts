/**
 * [INPUT]: ResolvedConfig, incident output string from tool execution
 * [OUTPUT]: createP0AutoEscalationHook — after-hook escalating P0 incidents
 * [POS]: Post-execution escalator, triggers rollback + postmortem protocol on P0
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import type { ResolvedConfig } from "../plugin-config";

/* ------------------------------------------------------------------ */
/*  Hook factory                                                       */
/* ------------------------------------------------------------------ */

export function createP0AutoEscalationHook(_config: ResolvedConfig) {
  return {
    after: async (
      input: { tool: string; sessionID: string },
      output: { title: string; output: string; metadata: unknown },
    ) => {
      if (input.tool !== "ohmymkt_incident") return;
      if (!output.output.includes("P0")) return;

      output.output += `\n\n---\n[P0 AUTO-ESCALATION] Critical incident detected. `
        + `Immediate actions required:\n`
        + `1. Pause all active scale modules\n`
        + `2. Rollback high-risk template changes from current cycle\n`
        + `3. Open postmortem within 24 hours\n`
        + `4. Run ohmymkt_run_cycle to reassess system state`;
    },
  };
}
