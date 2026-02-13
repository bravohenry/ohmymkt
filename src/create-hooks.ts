/**
 * [INPUT]: Plugin context, resolved config, 4 hook factories from hooks/
 * [OUTPUT]: Hook collections for before/after/event lifecycle
 * [POS]: Hook registration assembly, wires hook definitions into plugin lifecycle
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import type { ResolvedConfig } from "./plugin-config";
import { createGateEnforcerHook } from "./hooks/gate-enforcer";
import { createDualTrackBalanceHook } from "./hooks/dual-track-balance";
import { createP0AutoEscalationHook } from "./hooks/p0-auto-escalation";
import { createCycleReminderHook } from "./hooks/cycle-reminder";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type BeforeHook = {
  before: (input: { tool: string; sessionID: string }, output: { args: Record<string, unknown> }) => Promise<void>;
};

type AfterHook = {
  after: (input: { tool: string; sessionID: string }, output: { title: string; output: string; metadata: unknown }) => Promise<void>;
};

type EventHook = {
  event: (event: { type: string; properties?: Record<string, unknown> }) => Promise<void>;
};

export interface HookCollection {
  beforeHooks: BeforeHook[];
  afterHooks: AfterHook[];
  eventHooks: EventHook[];
}

/* ------------------------------------------------------------------ */
/*  Factory                                                            */
/* ------------------------------------------------------------------ */

export function createHooks(config: ResolvedConfig): HookCollection {
  return {
    beforeHooks: [
      createGateEnforcerHook(config),
    ],
    afterHooks: [
      createDualTrackBalanceHook(config),
      createP0AutoEscalationHook(config),
    ],
    eventHooks: [
      createCycleReminderHook(config),
    ],
  };
}
