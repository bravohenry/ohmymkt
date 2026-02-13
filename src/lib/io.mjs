/**
 * [INPUT]: Depends on Node.js fs/path and path conventions from src/lib/constants.mjs.
 * [OUTPUT]: Exports file I/O, directory ensure, serialization, and time utility functions.
 * [POS]: I/O foundation layer in src/lib, ensuring persistent runtime-state consistency.
 * [PROTOCOL]: Update this header when changed, then check AGENTS.md
 */

import fs from "node:fs";
import path from "node:path";

export function resolveProjectRoot(cwd = process.cwd()) {
  return path.resolve(cwd);
}

export function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function writeJsonFile(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

export function readJsonFile(filePath, fallback = null) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeTextFile(filePath, text) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, text, "utf8");
}

export function readTextFile(filePath, fallback = "") {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return fallback;
  }
}

export function fileExists(filePath) {
  return fs.existsSync(filePath);
}

export function listFiles(dirPath, filterFn = null) {
  if (!fs.existsSync(dirPath)) return [];
  const entries = fs.readdirSync(dirPath);
  const full = entries.map((name) => path.join(dirPath, name));
  return filterFn ? full.filter(filterFn) : full;
}

export function nowIso() {
  return new Date().toISOString();
}

export function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

export function slugify(input) {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "untitled";
}

export function parseDurationWindow(windowValue) {
  const value = String(windowValue || "30d").toLowerCase();
  const match = value.match(/^(\d+)(d)$/);
  if (!match) return 30;
  const days = Number(match[1]);
  if (!Number.isFinite(days) || days <= 0) return 30;
  return days;
}
