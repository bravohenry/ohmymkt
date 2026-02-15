/**
 * [INPUT]: Gate templates, handbook gate rules (section 1.7)
 * [OUTPUT]: Gate state loading, evaluation, action recommendations, formatted reporting
 * [POS]: Gate engine that determines whether scale execution is allowed
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import { runtimePaths, templatePaths, type TemplatePaths } from "./constants";
import { readJsonFile, writeJsonFile, fileExists, nowIso } from "./io";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface GateMeta {
  key: string;
  owner: string;
  label: string;
}

export interface GateEvaluation extends GateMeta {
  status: "pass" | "fail";
  reason: string;
}

export interface GateResult {
  allPassed: boolean;
  evaluations: GateEvaluation[];
  gateState: Record<string, unknown>;
}

/* ------------------------------------------------------------------ */
/*  Gate metadata                                                      */
/* ------------------------------------------------------------------ */

const GATE_META: GateMeta[] = [
  { key: "strategy_gate", owner: "SEO Lead", label: "Strategy Gate" },
  { key: "compliance_gate", owner: "SEO Lead", label: "Compliance Gate" },
  { key: "capacity_gate", owner: "Content Lead", label: "Capacity Gate" },
  { key: "data_gate", owner: "Growth Analyst", label: "Data Gate" },
  { key: "ownership_gate", owner: "SEO Lead", label: "Ownership Gate" },
];

export { GATE_META };

/* ------------------------------------------------------------------ */
/*  Individual gate evaluators                                         */
/* ------------------------------------------------------------------ */

function evaluateStrategyGate(state: Record<string, unknown> | undefined) {
  const pass = Boolean(state?.kpi_tree_bound) && Boolean(state?.approved);
  const reason = pass
    ? "KPI tree is bound to business goal and approved"
    : "Bind KPI tree to business goal and complete review approval";
  return { pass, reason };
}

function evaluateComplianceGate(state: Record<string, unknown> | undefined) {
  const pass = Boolean(state?.documented) && Boolean(state?.accepted_by_all);
  const reason = pass
    ? "Compliance guardrails are documented and accepted"
    : "Document guardrails and confirm team-wide acceptance";
  return { pass, reason };
}

function evaluateCapacityGate(state: Record<string, unknown> | undefined) {
  const weeks = Number((state as Record<string, unknown>)?.rolling_weeks_feasible || 0);
  const pass = weeks >= 8;
  const reason = pass
    ? `Rolling throughput is feasible for ${weeks} weeks`
    : `Throughput must be proven for 8 weeks (current: ${weeks})`;
  return { pass, reason };
}

function evaluateDataGate(state: Record<string, unknown> | undefined) {
  const pass = Boolean(state?.dashboard_stable) && Boolean(state?.reconcilable);
  const reason = pass
    ? "Dashboard is stable and data is reconcilable"
    : "Stabilize dashboard refresh and enforce dual-value conflict handling";
  return { pass, reason };
}

function evaluateOwnershipGate(state: Record<string, unknown> | undefined) {
  const coverage = Number((state as Record<string, unknown>)?.priority_query_coverage || 0);
  const pass = coverage >= 0.85;
  const reason = pass
    ? `Priority query ownership coverage is ${coverage}`
    : `Priority query ownership coverage must be >= 0.85 (current: ${coverage})`;
  return { pass, reason };
}

/* ------------------------------------------------------------------ */
/*  Core evaluation                                                    */
/* ------------------------------------------------------------------ */

type GateEvaluator = (state: Record<string, unknown> | undefined) => { pass: boolean; reason: string };

const EVALUATORS: Record<string, GateEvaluator> = {
  strategy_gate: evaluateStrategyGate,
  compliance_gate: evaluateComplianceGate,
  capacity_gate: evaluateCapacityGate,
  data_gate: evaluateDataGate,
  ownership_gate: evaluateOwnershipGate,
};

export function evaluateGates(gateState: Record<string, unknown>): GateEvaluation[] {
  return GATE_META.map((meta) => {
    const fn = EVALUATORS[meta.key];
    const result = fn(gateState?.[meta.key] as Record<string, unknown> | undefined);
    return { ...meta, status: result.pass ? "pass" : "fail", reason: result.reason };
  });
}

/* ------------------------------------------------------------------ */
/*  State loading + full evaluation                                    */
/* ------------------------------------------------------------------ */

export function loadGateState(
  projectRoot: string,
  tpl?: TemplatePaths,
): Record<string, unknown> {
  const runtime = runtimePaths(projectRoot);
  const templates = tpl ?? templatePaths(projectRoot);

  if (!fileExists(runtime.gatesFile)) {
    const template = readJsonFile<Record<string, unknown>>(templates.gatesTemplate, {});
    writeJsonFile(runtime.gatesFile, { ...template, updated_at: nowIso() });
  }

  return readJsonFile<Record<string, unknown>>(runtime.gatesFile, {});
}

export function evaluateCurrentGates(
  projectRoot: string,
  tpl?: TemplatePaths,
): GateResult {
  const gateState = loadGateState(projectRoot, tpl);
  const evaluations = evaluateGates(gateState);
  const allPassed = evaluations.every((e) => e.status === "pass");
  return { allPassed, evaluations, gateState };
}

/* ------------------------------------------------------------------ */
/*  Formatting                                                         */
/* ------------------------------------------------------------------ */

export function formatGateReport(evaluations: GateEvaluation[]): string {
  const lines = ["Gate Status", "-----------"];
  for (const item of evaluations) {
    lines.push(
      `- ${item.label}: ${item.status.toUpperCase()} (${item.owner})`,
      `  reason: ${item.reason}`,
    );
  }
  return lines.join("\n");
}
