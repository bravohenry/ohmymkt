/**
 * [INPUT]: Gate state, metric state, incident counts, active campaign context
 * [OUTPUT]: Cycle execution, continue/intervene/rollback decisions, decide, defaultActions, renderCycleReport
 * [POS]: Cadence engine supporting Execution Manager operational loops
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import path from "node:path";
import { runtimePaths, type TemplatePaths } from "./constants";
import { ensureDir, readJsonFile, writeJsonFile, writeTextFile, nowIso, todayStamp } from "./io";
import { evaluateCurrentGates, type GateResult } from "./gates";
import { listIncidents, countIncidentSeverity, type IncidentSeverityCount } from "./incidents";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type Cadence = "weekly" | "monthly" | "quarterly";
export type Decision = "continue" | "intervene" | "rollback";

export interface DecisionResult {
  decision: Decision;
  reason: string;
}

export interface CycleResult {
  reportFile: string;
  decision: Decision;
  reason: string;
  actions: string[];
}

interface CycleReportInput {
  cadence: Cadence;
  activePlan: string;
  gateResult: GateResult;
  metrics: Record<string, unknown>;
  incidentCount: IncidentSeverityCount;
  decision: Decision;
  decisionReason: string;
  actions: string[];
  timestamp: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const CADENCE_SET = new Set<string>(["weekly", "monthly", "quarterly"]);

/* ------------------------------------------------------------------ */
/*  Decision engine (exported for tool layer)                          */
/* ------------------------------------------------------------------ */

export function decide(
  metrics: Record<string, unknown>,
  incidentCount: IncidentSeverityCount,
): DecisionResult {
  const visibility = (metrics?.visibility_track ?? {}) as Record<string, string>;
  const quality = (metrics?.quality_track ?? {}) as Record<string, string>;

  const visibilityUp =
    visibility.non_brand_visibility_trend === "up" ||
    visibility.query_cluster_coverage_trend === "up";

  const qualityUp =
    quality.high_intent_session_trend === "up" ||
    quality.conversion_assist_trend === "up";

  if (incidentCount.p0 > 0) {
    return { decision: "rollback", reason: "P0 incident detected in current observation window" };
  }
  if (visibilityUp && !qualityUp) {
    return { decision: "intervene", reason: "Visibility rises while quality does not improve" };
  }
  if (visibilityUp && qualityUp) {
    return { decision: "continue", reason: "Visibility and quality both show upward trend" };
  }
  return { decision: "intervene", reason: "Insufficient multi-track progress for safe scale" };
}

/* ------------------------------------------------------------------ */
/*  Default actions per cadence + decision                             */
/* ------------------------------------------------------------------ */

export function defaultActions(cadence: Cadence, decision: Decision): string[] {
  const base: Record<Decision, string[]> = {
    continue: [
      "Expand winning query clusters with proven templates",
      "Keep dual-track allocation balanced",
      "Archive winner patterns in quarterly playbook",
    ],
    intervene: [
      "Run focused remediation sprint on failing modules",
      "Re-check gates and data consistency before expansion",
      "Adjust refresh/new ratio for next cycle",
    ],
    rollback: [
      "Pause scale modules immediately",
      "Rollback high-risk template changes",
      "Open P0 postmortem and prevention actions",
    ],
  };

  if (cadence === "weekly") return base[decision];
  if (cadence === "monthly") return [...base[decision], "Rebalance cluster-level investment"];
  return [...base[decision], "Run architecture governance review"];
}

/* ------------------------------------------------------------------ */
/*  Report renderer (exported for tool layer)                          */
/* ------------------------------------------------------------------ */

export function renderCycleReport(input: CycleReportInput): string {
  const {
    cadence, activePlan, gateResult, metrics, incidentCount,
    decision, decisionReason, actions, timestamp,
  } = input;

  const vis = (metrics?.visibility_track ?? {}) as Record<string, string>;
  const qual = (metrics?.quality_track ?? {}) as Record<string, string>;

  return `# ${cadence[0].toUpperCase()}${cadence.slice(1)} Cycle Report (${todayStamp()})

## Context
- Active plan: ${activePlan || "none"}
- Generated at: ${timestamp}

## Gate Snapshot
${gateResult.evaluations.map((e) => `- ${e.label}: ${e.status.toUpperCase()} (${e.reason})`).join("\n")}

## Track Metrics
- Visibility / non-brand trend: ${vis.non_brand_visibility_trend ?? "unknown"}
- Visibility / cluster coverage trend: ${vis.query_cluster_coverage_trend ?? "unknown"}
- Quality / high-intent session trend: ${qual.high_intent_session_trend ?? "unknown"}
- Quality / conversion assist trend: ${qual.conversion_assist_trend ?? "unknown"}

## Incidents in Window
- P0: ${incidentCount.p0}
- P1: ${incidentCount.p1}
- P2: ${incidentCount.p2}

## Decision
- Decision: ${decision}
- Reason: ${decisionReason}

## Next Actions
${actions.map((a) => `- ${a}`).join("\n")}
`;
}

/* ------------------------------------------------------------------ */
/*  Cycle execution                                                    */
/* ------------------------------------------------------------------ */

export function runCycle(
  projectRoot: string,
  cadence: string,
  tpl?: TemplatePaths,
): CycleResult {
  const normalized = String(cadence || "").toLowerCase() as Cadence;
  if (!CADENCE_SET.has(normalized)) {
    throw new Error("Cycle cadence must be one of: weekly, monthly, quarterly");
  }

  const runtime = runtimePaths(projectRoot);
  ensureDir(runtime.reportsDir);
  ensureDir(runtime.stateDir);

  const gateResult = evaluateCurrentGates(projectRoot, tpl);
  const metrics = readJsonFile<Record<string, unknown>>(runtime.metricsFile, {});
  const days = normalized === "weekly" ? 7 : normalized === "monthly" ? 30 : 90;
  const incidents = listIncidents(projectRoot, days);
  const incidentCount = countIncidentSeverity(incidents);

  const decisionResult = decide(metrics, incidentCount);
  const actions = defaultActions(normalized, decisionResult.decision);

  const execution = readJsonFile<Record<string, unknown>>(runtime.executionFile, {});
  const activePlan = String(execution?.active_plan ?? "");

  const reportBody = renderCycleReport({
    cadence: normalized,
    activePlan,
    gateResult,
    metrics,
    incidentCount,
    decision: decisionResult.decision,
    decisionReason: decisionResult.reason,
    actions,
    timestamp: nowIso(),
  });

  const reportDir = path.join(runtime.reportsDir, normalized);
  ensureDir(reportDir);
  const reportFile = path.join(reportDir, `${todayStamp()}-${normalized}.md`);
  writeTextFile(reportFile, reportBody);

  const cycles = readJsonFile<unknown[]>(runtime.cycleLogFile, []);
  cycles.push({
    cadence: normalized,
    report_file: reportFile,
    decision: decisionResult.decision,
    reason: decisionResult.reason,
    generated_at: nowIso(),
  });
  writeJsonFile(runtime.cycleLogFile, cycles);

  return {
    reportFile,
    decision: decisionResult.decision,
    reason: decisionResult.reason,
    actions,
  };
}
