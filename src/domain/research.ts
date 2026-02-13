/**
 * [INPUT]: io.ts, constants.ts
 * [OUTPUT]: Research brief, positioning, and asset manifest CRUD functions
 * [POS]: Domain layer for Vibe Flow Phase 1-3 (research → positioning → assets → publish)
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import path from "node:path";
import { runtimePaths } from "./constants";
import { readJsonFile, writeJsonFile, ensureDir, nowIso, slugify } from "./io";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ResearchBrief {
  id: string;
  title: string;
  objectives: string[];
  competitors: string[];
  findings: ResearchFinding[];
  gaps: string[];
  created_at: string;
  updated_at: string;
}

export interface ResearchFinding {
  source: string;
  finding: string;
  relevance: string;
  action: string;
}

export interface PositioningAngle {
  name: string;
  statement: string;
  headline: string;
  proof_points: string[];
  risks: string[];
  score: Record<string, number>;
  selected: boolean;
  rationale: string;
  saved_at: string;
}

export interface AssetEntry {
  id: string;
  type: string;
  name: string;
  status: "planned" | "in_progress" | "done" | "blocked" | "published";
  format?: "text" | "image" | "video" | "html" | "email";
  path?: string;
  notes?: string;
  published_at?: string;
  published_url?: string;
  published_platforms?: string[];
  created_at: string;
  updated_at: string;
}

export interface AssetManifest {
  assets: AssetEntry[];
  updated_at: string;
}

/* ------------------------------------------------------------------ */
/*  Paths                                                              */
/* ------------------------------------------------------------------ */

function researchDir(projectRoot: string): string {
  return path.join(runtimePaths(projectRoot).runtimeRoot, "research");
}

function briefFile(projectRoot: string, id: string): string {
  return path.join(researchDir(projectRoot), `brief-${id}.json`);
}

function positioningFile(projectRoot: string): string {
  return path.join(researchDir(projectRoot), "positioning.json");
}

function manifestFile(projectRoot: string): string {
  return path.join(researchDir(projectRoot), "asset-manifest.json");
}

/* ------------------------------------------------------------------ */
/*  Research Brief                                                     */
/* ------------------------------------------------------------------ */

export function saveResearchBrief(
  projectRoot: string,
  brief: Omit<ResearchBrief, "id" | "created_at" | "updated_at">,
): ResearchBrief {
  const id = slugify(brief.title);
  const now = nowIso();
  const full: ResearchBrief = { ...brief, id, created_at: now, updated_at: now };
  ensureDir(researchDir(projectRoot));
  writeJsonFile(briefFile(projectRoot, id), full);
  return full;
}

export function readResearchBrief(
  projectRoot: string,
  id: string,
): ResearchBrief | null {
  const data = readJsonFile<ResearchBrief | null>(briefFile(projectRoot, id), null);
  return data;
}

export function listResearchBriefs(projectRoot: string): string[] {
  const dir = researchDir(projectRoot);
  try {
    const fs = require("node:fs") as typeof import("node:fs");
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
      .filter((f: string) => f.startsWith("brief-") && f.endsWith(".json"))
      .map((f: string) => f.replace("brief-", "").replace(".json", ""));
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/*  Positioning                                                        */
/* ------------------------------------------------------------------ */

export function savePositioning(
  projectRoot: string,
  angle: Omit<PositioningAngle, "saved_at">,
): PositioningAngle {
  ensureDir(researchDir(projectRoot));
  const existing = readJsonFile<PositioningAngle[]>(positioningFile(projectRoot), []);
  const full: PositioningAngle = { ...angle, saved_at: nowIso() };
  // Replace if same name exists, otherwise append
  const idx = existing.findIndex((a) => a.name === angle.name);
  if (idx >= 0) existing[idx] = full;
  else existing.push(full);
  writeJsonFile(positioningFile(projectRoot), existing);
  return full;
}

export function readPositioning(projectRoot: string): PositioningAngle[] {
  return readJsonFile<PositioningAngle[]>(positioningFile(projectRoot), []);
}

export function getSelectedPositioning(projectRoot: string): PositioningAngle | null {
  const all = readPositioning(projectRoot);
  return all.find((a) => a.selected) ?? null;
}

/* ------------------------------------------------------------------ */
/*  Asset Manifest                                                     */
/* ------------------------------------------------------------------ */

export function readAssetManifest(projectRoot: string): AssetManifest {
  return readJsonFile<AssetManifest>(manifestFile(projectRoot), {
    assets: [],
    updated_at: nowIso(),
  });
}

export function upsertAsset(
  projectRoot: string,
  entry: Omit<AssetEntry, "id" | "created_at" | "updated_at">,
): AssetManifest {
  ensureDir(researchDir(projectRoot));
  const manifest = readAssetManifest(projectRoot);
  const now = nowIso();
  const id = slugify(`${entry.type}-${entry.name}`);
  const idx = manifest.assets.findIndex((a) => a.id === id);
  const full: AssetEntry = { ...entry, id, created_at: now, updated_at: now };
  if (idx >= 0) {
    full.created_at = manifest.assets[idx].created_at;
    manifest.assets[idx] = full;
  } else {
    manifest.assets.push(full);
  }
  manifest.updated_at = now;
  writeJsonFile(manifestFile(projectRoot), manifest);
  return manifest;
}

/* ------------------------------------------------------------------ */
/*  Formatting                                                         */
/* ------------------------------------------------------------------ */

export function formatResearchBrief(brief: ResearchBrief): string {
  const lines = [
    `# Research Brief: ${brief.title}`,
    `ID: ${brief.id} | Created: ${brief.created_at}`,
    "",
    "## Objectives",
    ...brief.objectives.map((o) => `- ${o}`),
    "",
    "## Competitors",
    ...brief.competitors.map((c) => `- ${c}`),
    "",
    "## Findings",
    ...brief.findings.map(
      (f, i) =>
        `${i + 1}. **${f.finding}**\n   Source: ${f.source}\n   Relevance: ${f.relevance}\n   Action: ${f.action}`,
    ),
  ];
  if (brief.gaps.length > 0) {
    lines.push("", "## Gaps", ...brief.gaps.map((g) => `- ${g}`));
  }
  return lines.join("\n");
}

export function formatPositioning(angles: PositioningAngle[]): string {
  if (angles.length === 0) return "No positioning angles saved yet.";
  return angles
    .map(
      (a) =>
        `${a.selected ? "→ " : "  "}**${a.name}**: ${a.statement}\n  Headline: ${a.headline}\n  Rationale: ${a.rationale}`,
    )
    .join("\n\n");
}

export function formatAssetManifest(manifest: AssetManifest): string {
  if (manifest.assets.length === 0) return "No assets tracked yet.";
  const rows = manifest.assets.map(
    (a) => `| ${a.type} | ${a.name} | ${a.status} | ${a.format ?? "-"} | ${a.path ?? "-"} | ${a.published_platforms?.join(", ") ?? "-"} |`,
  );
  return `| Type | Name | Status | Format | Path | Published |\n|---|---|---|---|---|---|\n${rows.join("\n")}`;
}
