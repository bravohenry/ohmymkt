/**
 * [INPUT]: ResolvedConfig, runtimePaths for cycle log, readJsonFile for state
 * [OUTPUT]: createCycleReminderHook — event-hook checking weekly cycle staleness
 * [POS]: Background monitor, reminds agent when weekly cadence lapses beyond 7 days
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import type { ResolvedConfig } from "../plugin-config";
import { runtimePaths } from "../domain/constants";
import { readJsonFile } from "../domain/io";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const WEEKLY_CYCLE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/* ------------------------------------------------------------------ */
/*  Hook factory                                                       */
/* ------------------------------------------------------------------ */

export function createCycleReminderHook(config: ResolvedConfig) {
  return {
    event: async (event: { type: string; properties?: Record<string, unknown> }) => {
      if (!event.type) return;

      const runtime = runtimePaths(config.projectRoot);
      const cycles = readJsonFile<{ cadence?: string; generated_at?: string }[]>(
        runtime.cycleLogFile,
        [],
      );

      const lastWeekly = cycles
        .filter((c) => c.cadence === "weekly")
        .pop();

      if (!lastWeekly?.generated_at) return;

      const age = Date.now() - new Date(lastWeekly.generated_at).getTime();
      if (age <= WEEKLY_CYCLE_MAX_AGE_MS) return;

      const daysSince = Math.floor(age / (24 * 60 * 60 * 1000));
      console.warn(
        `[ohmymkt:cycle-reminder] Weekly cycle is ${daysSince} days overdue. `
        + `Run ohmymkt_run_cycle with cadence=weekly.`,
      );
    },
  };
}
