/**
 * [INPUT]: Depends on templates/gates.template.json and the handbook gate rules in section 1.7.
 * [OUTPUT]: Exports gate-state loading, evaluation, action recommendations, and formatted reporting.
 * [POS]: Gate engine in src/lib that determines whether scale execution is allowed.
 * [PROTOCOL]: Update this header when changed, then check AGENTS.md
 */

import { runtimePaths, templatePaths } from "./constants.mjs";
import {
  readJsonFile,
  writeJsonFile,
  fileExists,
  nowIso,
} from "./io.mjs";

const GATE_META = [
  { key: "strategy_gate", owner: "SEO Lead", label: "Strategy Gate" },
  { key: "compliance_gate", owner: "SEO Lead", label: "Compliance Gate" },
  { key: "capacity_gate", owner: "Content Lead", label: "Capacity Gate" },
  { key: "data_gate", owner: "Growth Analyst", label: "Data Gate" },
  { key: "ownership_gate", owner: "SEO Lead", label: "Ownership Gate" },
];

export function loadGateState(projectRoot) {
  const runtime = runtimePaths(projectRoot);
  const templates = templatePaths(projectRoot);

  if (!fileExists(runtime.gatesFile)) {
    const template = readJsonFile(templates.gatesTemplate, {});
    writeJsonFile(runtime.gatesFile, {
      ...template,
      updated_at: nowIso(),
    });
  }

  return readJsonFile(runtime.gatesFile, {});
}

function evaluateStrategyGate(state) {
  const pass = Boolean(state?.kpi_tree_bound) && Boolean(state?.approved);
  const reason = pass
    ? "KPI tree is bound to business goal and approved"
    : "Bind KPI tree to business goal and complete review approval";
  return { pass, reason };
}

function evaluateComplianceGate(state) {
  const pass = Boolean(state?.documented) && Boolean(state?.accepted_by_all);
  const reason = pass
    ? "Compliance guardrails are documented and accepted"
    : "Document guardrails and confirm team-wide acceptance";
  return { pass, reason };
}

function evaluateCapacityGate(state) {
  const weeks = Number(state?.rolling_weeks_feasible || 0);
  const pass = weeks >= 8;
  const reason = pass
    ? `Rolling throughput is feasible for ${weeks} weeks`
    : `Throughput must be proven for 8 weeks (current: ${weeks})`;
  return { pass, reason };
}

function evaluateDataGate(state) {
  const pass = Boolean(state?.dashboard_stable) && Boolean(state?.reconcilable);
  const reason = pass
    ? "Dashboard is stable and data is reconcilable"
    : "Stabilize dashboard refresh and enforce dual-value conflict handling";
  return { pass, reason };
}

function evaluateOwnershipGate(state) {
  const coverage = Number(state?.priority_query_coverage || 0);
  const pass = coverage >= 0.85;
  const reason = pass
    ? `Priority query ownership coverage is ${coverage}`
    : `Priority query ownership coverage must be >= 0.85 (current: ${coverage})`;
  return { pass, reason };
}

export function evaluateGates(gateState) {
  const evaluators = {
    strategy_gate: evaluateStrategyGate,
    compliance_gate: evaluateComplianceGate,
    capacity_gate: evaluateCapacityGate,
    data_gate: evaluateDataGate,
    ownership_gate: evaluateOwnershipGate,
  };

  return GATE_META.map((meta) => {
    const fn = evaluators[meta.key];
    const result = fn(gateState?.[meta.key]);
    return {
      ...meta,
      status: result.pass ? "pass" : "fail",
      reason: result.reason,
    };
  });
}

export function evaluateCurrentGates(projectRoot) {
  const gateState = loadGateState(projectRoot);
  const evaluations = evaluateGates(gateState);
  const allPassed = evaluations.every((item) => item.status === "pass");

  return {
    allPassed,
    evaluations,
    gateState,
  };
}

export function formatGateReport(evaluations) {
  const lines = [
    "Gate Status",
    "-----------",
  ];

  for (const item of evaluations) {
    lines.push(
      `- ${item.label}: ${item.status.toUpperCase()} (${item.owner})`,
      `  reason: ${item.reason}`,
    );
  }

  return lines.join("\n");
}
