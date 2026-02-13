/**
 * [INPUT]: Node.js path module
 * [OUTPUT]: RuntimePaths, TemplatePaths interfaces and resolver functions
 * [POS]: Foundation constants layer, shared by all domain modules
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import path from "node:path";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface RuntimePaths {
  runtimeRoot: string;
  plansDir: string;
  notepadsDir: string;
  reportsDir: string;
  incidentsDir: string;
  stateDir: string;
  boulderFile: string;
  gatesFile: string;
  metricsFile: string;
  modulesFile: string;
  cycleLogFile: string;
  sprintBoardFile: string;
  executionFile: string;
}

export interface TemplatePaths {
  templateDir: string;
  gatesTemplate: string;
  metricsTemplate: string;
  modulesTemplate: string;
  taskPoolTemplate: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

export const RUNTIME_DIR_NAME = ".ohmymkt";

/* ------------------------------------------------------------------ */
/*  Path resolvers                                                     */
/* ------------------------------------------------------------------ */

export function runtimePaths(projectRoot: string): RuntimePaths {
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

export function templatePaths(baseDir: string): TemplatePaths {
  const templateDir = path.join(baseDir, "templates");
  return {
    templateDir,
    gatesTemplate: path.join(templateDir, "gates.template.json"),
    metricsTemplate: path.join(templateDir, "metrics.template.json"),
    modulesTemplate: path.join(templateDir, "modules.template.json"),
    taskPoolTemplate: path.join(templateDir, "task-pool-40.json"),
  };
}
