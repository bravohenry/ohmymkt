/**
 * [INPUT]: Runtime directories, incident severity protocol (P0/P1/P2)
 * [OUTPUT]: Incident registration, lookup, severity counting
 * [POS]: Incident-protocol layer, used by rollback and intervention decisions
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import path from "node:path";
import { runtimePaths } from "./constants";
import { ensureDir, writeJsonFile, readJsonFile, listFiles, nowIso, slugify } from "./io";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type Severity = "P0" | "P1" | "P2";

export interface IncidentInput {
  severity: string;
  module: string;
  summary: string;
}

export interface IncidentRecord {
  id: string;
  severity: Severity;
  module: string;
  summary: string;
  created_at: string;
}

export interface IncidentSeverityCount {
  p0: number;
  p1: number;
  p2: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SEVERITY_SET = new Set<string>(["P0", "P1", "P2"]);

/* ------------------------------------------------------------------ */
/*  Registration                                                       */
/* ------------------------------------------------------------------ */

export function registerIncident(
  projectRoot: string,
  input: IncidentInput,
): { record: IncidentRecord; filePath: string } {
  const severity = String(input.severity || "").toUpperCase();
  if (!SEVERITY_SET.has(severity)) {
    throw new Error("Severity must be one of: P0, P1, P2");
  }

  const moduleName = String(input.module || "unspecified");
  const summary = String(input.summary || "").trim();
  if (!summary) throw new Error("Incident summary is required");

  const runtime = runtimePaths(projectRoot);
  ensureDir(runtime.incidentsDir);

  const timestamp = nowIso();
  const id = `INC-${timestamp.replace(/[:.]/g, "-")}-${severity}`;
  const record: IncidentRecord = {
    id,
    severity: severity as Severity,
    module: moduleName,
    summary,
    created_at: timestamp,
  };

  const filePath = path.join(runtime.incidentsDir, `${slugify(id)}.json`);
  writeJsonFile(filePath, record);
  return { record, filePath };
}

/* ------------------------------------------------------------------ */
/*  Queries                                                            */
/* ------------------------------------------------------------------ */

export function listIncidents(projectRoot: string, days: number = 30): IncidentRecord[] {
  const runtime = runtimePaths(projectRoot);
  const files = listFiles(runtime.incidentsDir, (fp) => fp.endsWith(".json"));
  const cutoff = Date.now() - Number(days) * 24 * 60 * 60 * 1000;

  return files
    .map((fp) => readJsonFile<IncidentRecord | null>(fp, null))
    .filter((r): r is IncidentRecord => r !== null)
    .filter((r) => new Date(r.created_at).getTime() >= cutoff)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export function countIncidentSeverity(incidents: IncidentRecord[]): IncidentSeverityCount {
  return incidents.reduce<IncidentSeverityCount>(
    (acc, item) => {
      if (item.severity === "P0") acc.p0 += 1;
      if (item.severity === "P1") acc.p1 += 1;
      if (item.severity === "P2") acc.p2 += 1;
      return acc;
    },
    { p0: 0, p1: 0, p2: 0 },
  );
}
