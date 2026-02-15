/**
 * [INPUT]: domain/gates (evaluateCurrentGates, formatGateReport), domain/constants (templatePaths)
 * [OUTPUT]: CLI exit code — 0 if all gates pass, 1 if any fail (stderr gets report)
 * [POS]: oh-my-opencode hook entry point, replaces gate-enforcer before-hook
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import path from "node:path";
import { evaluateCurrentGates, formatGateReport } from "../domain/gates";
import { templatePaths } from "../domain/constants";

/* ------------------------------------------------------------------ */
/*  Resolve paths                                                      */
/* ------------------------------------------------------------------ */

const PROJECT_ROOT = process.env.MKT_PROJECT_ROOT || process.cwd();
const PLUGIN_ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "../..",
);
const tpl = templatePaths(PLUGIN_ROOT);

/* ------------------------------------------------------------------ */
/*  Evaluate gates                                                     */
/* ------------------------------------------------------------------ */

const result = evaluateCurrentGates(PROJECT_ROOT, tpl);

if (result.allPassed) {
  process.exit(0);
}

const report = formatGateReport(result.evaluations);
process.stderr.write(
  `[BLOCKED] Cannot start campaign — not all gates pass.\n\n${report}\n\nResolve failing gates before launching.\n`,
);
process.exit(1);
