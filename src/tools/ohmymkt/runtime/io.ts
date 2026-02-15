/**
 * [INPUT]: Node.js fs/path modules
 * [OUTPUT]: File I/O, directory ensure, serialization, and time utility functions
 * [POS]: I/O foundation layer, ensuring persistent runtime-state consistency
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import fs from "node:fs";
import path from "node:path";

/* ------------------------------------------------------------------ */
/*  Directory / project root                                           */
/* ------------------------------------------------------------------ */

export function resolveProjectRoot(cwd: string = process.cwd()): string {
  return path.resolve(cwd);
}

export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/* ------------------------------------------------------------------ */
/*  JSON I/O                                                           */
/* ------------------------------------------------------------------ */

export function writeJsonFile(filePath: string, data: unknown): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

export function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/* ------------------------------------------------------------------ */
/*  Text I/O                                                           */
/* ------------------------------------------------------------------ */

export function writeTextFile(filePath: string, text: string): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, text, "utf8");
}

export function readTextFile(filePath: string, fallback: string = ""): string {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return fallback;
  }
}

/* ------------------------------------------------------------------ */
/*  File queries                                                       */
/* ------------------------------------------------------------------ */

export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

export function listFiles(
  dirPath: string,
  filterFn: ((p: string) => boolean) | null = null,
): string[] {
  if (!fs.existsSync(dirPath)) return [];
  const entries = fs.readdirSync(dirPath);
  const full = entries.map((name) => path.join(dirPath, name));
  return filterFn ? full.filter(filterFn) : full;
}

/* ------------------------------------------------------------------ */
/*  Time / string helpers                                              */
/* ------------------------------------------------------------------ */

export function nowIso(): string {
  return new Date().toISOString();
}

export function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

export function slugify(input: string): string {
  return (
    String(input)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "untitled"
  );
}

export function parseDurationWindow(windowValue: string | undefined): number {
  const value = String(windowValue || "30d").toLowerCase();
  const match = value.match(/^(\d+)(d)$/);
  if (!match) return 30;
  const days = Number(match[1]);
  if (!Number.isFinite(days) || days <= 0) return 30;
  return days;
}
