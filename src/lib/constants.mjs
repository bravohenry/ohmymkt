/**
 * [INPUT]: Depends on Node.js path and project-root conventions.
 * [OUTPUT]: Exports runtime directory constants and path resolver helpers.
 * [POS]: Foundation constants layer in src/lib, shared by all domain modules.
 * [PROTOCOL]: Update this header when changed, then check AGENTS.md
 */

import path from "node:path";

export const RUNTIME_DIR_NAME = ".ohmymkt";

export function runtimePaths(projectRoot) {
  const runtimeRoot = path.join(projectRoot, RUNTIME_DIR_NAME);
  return {
    runtimeRoot,
    plansDir: path.join(runtimeRoot, "plans"),
    notepadsDir: path.join(runtimeRoot, "notepads"),
    reportsDir: path.join(runtimeRoot, "reports"),
    incidentsDir: path.join(runtimeRoot, "incidents"),
    stateDir: path.join(runtimeRoot, "state"),
    boulderFile: path.join(runtimeRoot, "boulder.json"),
    gatesFile: path.join(runtimeRoot, "state", "gates.json"),
    metricsFile: path.join(runtimeRoot, "state", "metrics.json"),
    modulesFile: path.join(runtimeRoot, "state", "modules.json"),
    cycleLogFile: path.join(runtimeRoot, "state", "cycles.json"),
    sprintBoardFile: path.join(runtimeRoot, "state", "sprint-board.json"),
    executionFile: path.join(runtimeRoot, "state", "execution.json"),
  };
}

export function templatePaths(projectRoot) {
  const templateDir = path.join(projectRoot, "templates");
  return {
    templateDir,
    gatesTemplate: path.join(templateDir, "gates.template.json"),
    metricsTemplate: path.join(templateDir, "metrics.template.json"),
    modulesTemplate: path.join(templateDir, "modules.template.json"),
    taskPoolTemplate: path.join(templateDir, "task-pool-40.json"),
  };
}
