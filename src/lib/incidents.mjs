/**
 * [INPUT]: Depends on runtime directories and incident severity protocol rules (P0/P1/P2).
 * [OUTPUT]: Exports incident registration, lookup, and severity-count capabilities.
 * [POS]: Incident-protocol layer in src/lib, used by rollback and intervention decisions.
 * [PROTOCOL]: Update this header when changed, then check AGENTS.md
 */

import path from "node:path";
import { runtimePaths } from "./constants.mjs";
import {
  ensureDir,
  writeJsonFile,
  readJsonFile,
  listFiles,
  nowIso,
  slugify,
} from "./io.mjs";

const SEVERITY_SET = new Set(["P0", "P1", "P2"]);

export function registerIncident(projectRoot, input) {
  const severity = String(input.severity || "").toUpperCase();
  if (!SEVERITY_SET.has(severity)) {
    throw new Error("Severity must be one of: P0, P1, P2");
  }

  const moduleName = String(input.module || "unspecified");
  const summary = String(input.summary || "").trim();
  if (!summary) {
    throw new Error("Incident summary is required");
  }

  const runtime = runtimePaths(projectRoot);
  ensureDir(runtime.incidentsDir);

  const timestamp = nowIso();
  const id = `INC-${timestamp.replace(/[:.]/g, "-")}-${severity}`;
  const record = {
    id,
    severity,
    module: moduleName,
    summary,
    created_at: timestamp,
  };

  const filePath = path.join(runtime.incidentsDir, `${slugify(id)}.json`);
  writeJsonFile(filePath, record);

  return { record, filePath };
}

export function listIncidents(projectRoot, days = 30) {
  const runtime = runtimePaths(projectRoot);
  const files = listFiles(runtime.incidentsDir, (filePath) => filePath.endsWith(".json"));
  const cutoff = Date.now() - Number(days) * 24 * 60 * 60 * 1000;

  return files
    .map((filePath) => readJsonFile(filePath, null))
    .filter(Boolean)
    .filter((item) => new Date(item.created_at).getTime() >= cutoff)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export function countIncidentSeverity(incidents) {
  return incidents.reduce(
    (acc, item) => {
      if (item.severity === "P0") acc.p0 += 1;
      if (item.severity === "P1") acc.p1 += 1;
      if (item.severity === "P2") acc.p2 += 1;
      return acc;
    },
    { p0: 0, p1: 0, p2: 0 },
  );
}
