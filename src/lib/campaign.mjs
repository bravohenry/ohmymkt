/**
 * [INPUT]: Depends on gate evaluation, plan resolution, task-pool templates, and runtime state paths.
 * [OUTPUT]: Exports state-machine behavior for campaign start/resume.
 * [POS]: Execution entry layer in src/lib, triggered by Execution Manager commands.
 * [PROTOCOL]: Update this header when changed, then check AGENTS.md
 */

import path from "node:path";
import { runtimePaths, templatePaths } from "./constants.mjs";
import {
  ensureDir,
  writeJsonFile,
  readJsonFile,
  writeTextFile,
  fileExists,
  nowIso,
} from "./io.mjs";
import { evaluateCurrentGates } from "./gates.mjs";
import { resolvePlan } from "./plans.mjs";

function ensureRuntimeSkeleton(projectRoot) {
  const runtime = runtimePaths(projectRoot);
  ensureDir(runtime.runtimeRoot);
  ensureDir(runtime.plansDir);
  ensureDir(runtime.notepadsDir);
  ensureDir(runtime.reportsDir);
  ensureDir(runtime.incidentsDir);
  ensureDir(runtime.stateDir);

  const templates = templatePaths(projectRoot);

  if (!fileExists(runtime.metricsFile)) {
    writeJsonFile(runtime.metricsFile, readJsonFile(templates.metricsTemplate, {}));
  }

  if (!fileExists(runtime.modulesFile)) {
    writeJsonFile(runtime.modulesFile, readJsonFile(templates.modulesTemplate, {}));
  }

  if (!fileExists(runtime.cycleLogFile)) {
    writeJsonFile(runtime.cycleLogFile, []);
  }
}

function ensureNotepads(runtime, planFileName) {
  const bucket = path.basename(planFileName, ".md");
  const planNotepadDir = path.join(runtime.notepadsDir, bucket);
  ensureDir(planNotepadDir);

  const files = {
    learnings: path.join(planNotepadDir, "learnings.md"),
    decisions: path.join(planNotepadDir, "decisions.md"),
    issues: path.join(planNotepadDir, "issues.md"),
    verification: path.join(planNotepadDir, "verification.md"),
    incidents: path.join(planNotepadDir, "incidents.md"),
  };

  for (const [key, filePath] of Object.entries(files)) {
    if (!fileExists(filePath)) {
      writeTextFile(filePath, `# ${key}\n\n`);
    }
  }

  return { planNotepadDir, files };
}

function ensureSprintBoard(projectRoot, runtime) {
  if (fileExists(runtime.sprintBoardFile)) {
    return readJsonFile(runtime.sprintBoardFile, []);
  }

  const templates = templatePaths(projectRoot);
  const taskPool = readJsonFile(templates.taskPoolTemplate, []);
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

export function startCampaign(projectRoot, planHint = "") {
  ensureRuntimeSkeleton(projectRoot);

  const gateResult = evaluateCurrentGates(projectRoot);
  if (!gateResult.allPassed) {
    return {
      ok: false,
      blocked: true,
      reason: "Startup gates are not all passed",
      gateResult,
    };
  }

  const runtime = runtimePaths(projectRoot);
  const plan = resolvePlan(projectRoot, planHint);
  if (!plan) {
    return {
      ok: false,
      blocked: true,
      reason: "No plan file found. Run plan-growth first.",
      gateResult,
    };
  }

  const notepads = ensureNotepads(runtime, plan.fileName);
  const sprintBoard = ensureSprintBoard(projectRoot, runtime);

  const boulder = {
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
    tracks: {
      visibility: "active",
      quality: "active",
    },
    updated_at: nowIso(),
  });

  return {
    ok: true,
    blocked: false,
    plan,
    boulder,
    notepads,
    sprintSize: sprintBoard.length,
  };
}
