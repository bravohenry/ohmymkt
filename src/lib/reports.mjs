/**
 * [INPUT]: Depends on cycle logs, incident records, and gate snapshots.
 * [OUTPUT]: Exports windowed growth summary reports.
 * [POS]: Aggregation/reporting layer in src/lib for management reviews and retrospectives.
 * [PROTOCOL]: Update this header when changed, then check AGENTS.md
 */

import path from "node:path";
import { runtimePaths } from "./constants.mjs";
import {
  ensureDir,
  readJsonFile,
  writeTextFile,
  nowIso,
  todayStamp,
  parseDurationWindow,
} from "./io.mjs";
import { listIncidents, countIncidentSeverity } from "./incidents.mjs";
import { evaluateCurrentGates } from "./gates.mjs";

function renderSummary(input) {
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

export function generateGrowthReport(projectRoot, windowValue = "30d") {
  const runtime = runtimePaths(projectRoot);
  ensureDir(runtime.reportsDir);

  const days = parseDurationWindow(windowValue);
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  const cycles = readJsonFile(runtime.cycleLogFile, []);
  const scopedCycles = cycles.filter((cycle) => new Date(cycle.generated_at).getTime() >= cutoff);

  const decisionCount = scopedCycles.reduce(
    (acc, cycle) => {
      const key = cycle.decision;
      if (key === "continue") acc.continue += 1;
      if (key === "intervene") acc.intervene += 1;
      if (key === "rollback") acc.rollback += 1;
      return acc;
    },
    { continue: 0, intervene: 0, rollback: 0 },
  );

  const incidents = listIncidents(projectRoot, days);
  const incidentCount = countIncidentSeverity(incidents);
  const gateResult = evaluateCurrentGates(projectRoot);

  const recommendations = [];
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

  return {
    filePath,
    days,
    decisionCount,
    incidentCount,
    gatesPassed: gateResult.allPassed,
  };
}
