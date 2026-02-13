/**
 * [INPUT]: Depends on gate state, metric state, incident counts, and active campaign context.
 * [OUTPUT]: Exports weekly/monthly/quarterly cycles and continue/intervene/rollback decisions.
 * [POS]: Cadence engine in src/lib that supports Execution Manager operational loops.
 * [PROTOCOL]: Update this header when changed, then check AGENTS.md
 */

import path from "node:path";
import { runtimePaths } from "./constants.mjs";
import {
  ensureDir,
  readJsonFile,
  writeJsonFile,
  writeTextFile,
  nowIso,
  todayStamp,
} from "./io.mjs";
import { evaluateCurrentGates } from "./gates.mjs";
import { listIncidents, countIncidentSeverity } from "./incidents.mjs";

const CADENCE_SET = new Set(["weekly", "monthly", "quarterly"]);

function decide(metrics, incidentCount) {
  const visibility = metrics?.visibility_track || {};
  const quality = metrics?.quality_track || {};

  const visibilityUp =
    visibility.non_brand_visibility_trend === "up" ||
    visibility.query_cluster_coverage_trend === "up";

  const qualityUp =
    quality.high_intent_session_trend === "up" ||
    quality.conversion_assist_trend === "up";

  if (incidentCount.p0 > 0) {
    return {
      decision: "rollback",
      reason: "P0 incident detected in current observation window",
    };
  }

  if (visibilityUp && !qualityUp) {
    return {
      decision: "intervene",
      reason: "Visibility rises while quality does not improve",
    };
  }

  if (visibilityUp && qualityUp) {
    return {
      decision: "continue",
      reason: "Visibility and quality both show upward trend",
    };
  }

  return {
    decision: "intervene",
    reason: "Insufficient multi-track progress for safe scale",
  };
}

function defaultActions(cadence, decision) {
  const base = {
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

function renderCycleReport(input) {
  const {
    cadence,
    activePlan,
    gateResult,
    metrics,
    incidentCount,
    decision,
    decisionReason,
    actions,
    timestamp,
  } = input;

  return `# ${cadence[0].toUpperCase()}${cadence.slice(1)} Cycle Report (${todayStamp()})

## Context
- Active plan: ${activePlan || "none"}
- Generated at: ${timestamp}

## Gate Snapshot
${gateResult.evaluations.map((item) => `- ${item.label}: ${item.status.toUpperCase()} (${item.reason})`).join("\n")}

## Track Metrics
- Visibility / non-brand trend: ${metrics?.visibility_track?.non_brand_visibility_trend || "unknown"}
- Visibility / cluster coverage trend: ${metrics?.visibility_track?.query_cluster_coverage_trend || "unknown"}
- Quality / high-intent session trend: ${metrics?.quality_track?.high_intent_session_trend || "unknown"}
- Quality / conversion assist trend: ${metrics?.quality_track?.conversion_assist_trend || "unknown"}

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

export function runCycle(projectRoot, cadence) {
  const normalized = String(cadence || "").toLowerCase();
  if (!CADENCE_SET.has(normalized)) {
    throw new Error("Cycle cadence must be one of: weekly, monthly, quarterly");
  }

  const runtime = runtimePaths(projectRoot);
  ensureDir(runtime.reportsDir);
  ensureDir(runtime.stateDir);

  const gateResult = evaluateCurrentGates(projectRoot);
  const metrics = readJsonFile(runtime.metricsFile, {});
  const days = normalized === "weekly" ? 7 : normalized === "monthly" ? 30 : 90;
  const incidents = listIncidents(projectRoot, days);
  const incidentCount = countIncidentSeverity(incidents);

  const decisionResult = decide(metrics, incidentCount);
  const actions = defaultActions(normalized, decisionResult.decision);

  const execution = readJsonFile(runtime.executionFile, {});
  const activePlan = execution?.active_plan || "";

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

  const cycles = readJsonFile(runtime.cycleLogFile, []);
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
