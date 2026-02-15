/**
 * [INPUT]: Gate evaluation, plan resolution, task-pool templates, runtime state
 * [OUTPUT]: Campaign start/resume state machine
 * [POS]: Execution entry layer, triggered by Execution Manager commands
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import path from "node:path";
import { runtimePaths, templatePaths, type TemplatePaths } from "./constants";
import { ensureDir, writeJsonFile, readJsonFile, writeTextFile, fileExists, nowIso } from "./io";
import { evaluateCurrentGates, type GateResult } from "./gates";
import { resolvePlan, type PlanInfo } from "./plans";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface NotepadFiles {
  learnings: string;
  decisions: string;
  issues: string;
  verification: string;
  incidents: string;
}

interface NotepadResult {
  planNotepadDir: string;
  files: NotepadFiles;
}

interface BoulderState {
  active_plan: string;
  plan_name: string;
  started_at: string;
  session_ids: string[];
  role: string;
}

export type CampaignResult =
  | { ok: false; blocked: true; reason: string; gateResult: GateResult }
  | { ok: true; blocked: false; plan: PlanInfo; boulder: BoulderState; notepads: NotepadResult; sprintSize: number };

/* ------------------------------------------------------------------ */
/*  Internal helpers                                                   */
/* ------------------------------------------------------------------ */

function ensureRuntimeSkeleton(projectRoot: string, tpl: TemplatePaths): void {
  const runtime = runtimePaths(projectRoot);
  ensureDir(runtime.runtimeRoot);
  ensureDir(runtime.plansDir);
  ensureDir(runtime.notepadsDir);
  ensureDir(runtime.reportsDir);
  ensureDir(runtime.incidentsDir);
  ensureDir(runtime.stateDir);

  if (!fileExists(runtime.metricsFile)) {
    writeJsonFile(runtime.metricsFile, readJsonFile(tpl.metricsTemplate, {}));
  }
  if (!fileExists(runtime.modulesFile)) {
    writeJsonFile(runtime.modulesFile, readJsonFile(tpl.modulesTemplate, {}));
  }
  if (!fileExists(runtime.cycleLogFile)) {
    writeJsonFile(runtime.cycleLogFile, []);
  }
}

function ensureNotepads(notepadsDir: string, planFileName: string): NotepadResult {
  const bucket = path.basename(planFileName, ".md");
  const planNotepadDir = path.join(notepadsDir, bucket);
  ensureDir(planNotepadDir);

  const files: NotepadFiles = {
    learnings: path.join(planNotepadDir, "learnings.md"),
    decisions: path.join(planNotepadDir, "decisions.md"),
    issues: path.join(planNotepadDir, "issues.md"),
    verification: path.join(planNotepadDir, "verification.md"),
    incidents: path.join(planNotepadDir, "incidents.md"),
  };

  for (const [key, fp] of Object.entries(files)) {
    if (!fileExists(fp)) writeTextFile(fp, `# ${key}\n\n`);
  }
  return { planNotepadDir, files };
}

function ensureSprintBoard(runtime: ReturnType<typeof runtimePaths>, tpl: TemplatePaths): unknown[] {
  if (fileExists(runtime.sprintBoardFile)) {
    return readJsonFile<unknown[]>(runtime.sprintBoardFile, []);
  }

  const taskPool = readJsonFile<Record<string, unknown>[]>(tpl.taskPoolTemplate, []);
  const sprint = taskPool.map((item) => ({
    ...item,
    status: "pending",
    owner: "",
    due_date: "",
    kpi_impact: "",
    rollback_condition: "",
  }));

  writeJsonFile(runtime.sprintBoardFile, sprint);
  return sprint;
}

/* ------------------------------------------------------------------ */
/*  Campaign start                                                     */
/* ------------------------------------------------------------------ */

export function startCampaign(
  projectRoot: string,
  planHint: string = "",
  tpl?: TemplatePaths,
): CampaignResult {
  const templates = tpl ?? templatePaths(projectRoot);
  ensureRuntimeSkeleton(projectRoot, templates);

  const gateResult = evaluateCurrentGates(projectRoot, templates);
  if (!gateResult.allPassed) {
    return { ok: false, blocked: true, reason: "Startup gates are not all passed", gateResult };
  }

  const plan = resolvePlan(projectRoot, planHint);
  if (!plan) {
    return { ok: false, blocked: true, reason: "No plan file found. Run plan-growth first.", gateResult };
  }

  const runtime = runtimePaths(projectRoot);
  const notepads = ensureNotepads(runtime.notepadsDir, plan.fileName);
  const sprintBoard = ensureSprintBoard(runtime, templates);

  const boulder: BoulderState = {
    active_plan: plan.filePath,
    plan_name: plan.fileName,
    started_at: nowIso(),
    session_ids: [],
    role: "Execution Manager",
  };

  writeJsonFile(runtime.boulderFile, boulder);
  writeJsonFile(runtime.executionFile, {
    active_plan: plan.fileName,
    mode: "execution",
    tracks: { visibility: "active", quality: "active" },
    updated_at: nowIso(),
  });

  return { ok: true, blocked: false, plan, boulder, notepads, sprintSize: sprintBoard.length };
}
