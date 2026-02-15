/**
 * [INPUT]: Cycle logs, incident records, gate snapshots
 * [OUTPUT]: Windowed growth summary reports, renderSummary
 * [POS]: Aggregation/reporting layer for management reviews and retrospectives
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import path from "node:path";
import { runtimePaths, type TemplatePaths } from "./constants";
import { ensureDir, readJsonFile, writeTextFile, nowIso, todayStamp, parseDurationWindow } from "./io";
import { listIncidents, countIncidentSeverity, type IncidentSeverityCount } from "./incidents";
import { evaluateCurrentGates, type GateEvaluation } from "./gates";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SummaryInput {
  window: string;
  generatedAt: string;
  gatesPassed: boolean;
  gates: GateEvaluation[];
  decisionCount: { continue: number; intervene: number; rollback: number };
  incidentCount: IncidentSeverityCount;
  recommendations: string[];
}

export interface GrowthReportResult {
  filePath: string;
  days: number;
  decisionCount: { continue: number; intervene: number; rollback: number };
  incidentCount: IncidentSeverityCount;
  gatesPassed: boolean;
}

/* ------------------------------------------------------------------ */
/*  Renderer (exported for tool layer)                                 */
/* ------------------------------------------------------------------ */

export function renderSummary(input: SummaryInput): string {
  return `# Growth Summary (${input.window})

## Snapshot
- Generated at: ${input.generatedAt}
- Gate pass status: ${input.gatesPassed ? "PASS" : "FAIL"}

## Gate Details
${input.gates.map((g) => `- ${g.label}: ${g.status.toUpperCase()}`).join("\n")}

## Cycle Decisions (${input.window})
- Continue: ${input.decisionCount.continue}
- Intervene: ${input.decisionCount.intervene}
- Rollback: ${input.decisionCount.rollback}

## Incident Severity (${input.window})
- P0: ${input.incidentCount.p0}
- P1: ${input.incidentCount.p1}
- P2: ${input.incidentCount.p2}

## Recommendations
${input.recommendations.map((r) => `- ${r}`).join("\n")}
`;
}

/* ------------------------------------------------------------------ */
/*  Report generation                                                  */
/* ------------------------------------------------------------------ */

export function generateGrowthReport(
  projectRoot: string,
  windowValue: string = "30d",
  tpl?: TemplatePaths,
): GrowthReportResult {
  const runtime = runtimePaths(projectRoot);
  ensureDir(runtime.reportsDir);

  const days = parseDurationWindow(windowValue);
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  interface CycleLogEntry { decision: string; generated_at: string }
  const cycles = readJsonFile<CycleLogEntry[]>(runtime.cycleLogFile, []);
  const scopedCycles = cycles.filter(
    (c) => new Date(c.generated_at).getTime() >= cutoff,
  );

  const decisionCount = scopedCycles.reduce<{ continue: number; intervene: number; rollback: number }>(
    (acc, c) => {
      if (c.decision === "continue") acc.continue += 1;
      if (c.decision === "intervene") acc.intervene += 1;
      if (c.decision === "rollback") acc.rollback += 1;
      return acc;
    },
    { continue: 0, intervene: 0, rollback: 0 },
  );

  const incidents = listIncidents(projectRoot, days);
  const incidentCount = countIncidentSeverity(incidents);
  const gateResult = evaluateCurrentGates(projectRoot, tpl);

  const recommendations: string[] = [];
  if (!gateResult.allPassed) {
    recommendations.push("Do not run scale modules until all startup gates pass");
  }
  if (decisionCount.rollback > 0 || incidentCount.p0 > 0) {
    recommendations.push("Prioritize rollback prevention actions before next scale cycle");
  }
  if (decisionCount.intervene > decisionCount.continue) {
    recommendations.push("Increase remediation capacity for quality track modules");
  }
  if (recommendations.length === 0) {
    recommendations.push("Keep dual-track execution and continue winner-pattern codification");
  }

  const report = renderSummary({
    window: `${days}d`,
    generatedAt: nowIso(),
    gatesPassed: gateResult.allPassed,
    gates: gateResult.evaluations,
    decisionCount,
    incidentCount,
    recommendations,
  });

  const summaryDir = path.join(runtime.reportsDir, "summary");
  ensureDir(summaryDir);
  const filePath = path.join(summaryDir, `${todayStamp()}-${days}d.md`);
  writeTextFile(filePath, report);

  return { filePath, days, decisionCount, incidentCount, gatesPassed: gateResult.allPassed };
}
