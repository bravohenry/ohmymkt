/**
 * [INPUT]: Depends on the role catalog, gate rules, and execution-module definitions.
 * [OUTPUT]: Exports plan creation, listing, and resolution functions.
 * [POS]: Planning layer in src/lib that captures structured Planner output.
 * [PROTOCOL]: Update this header when changed, then check AGENTS.md
 */

import path from "node:path";
import { ROLE_CATALOG } from "./roles.mjs";
import { runtimePaths } from "./constants.mjs";
import {
  ensureDir,
  writeTextFile,
  listFiles,
  readTextFile,
  slugify,
  todayStamp,
} from "./io.mjs";

function renderRoleTable() {
  const lines = [
    "| Role | Responsibility | Deliverable |",
    "|---|---|---|",
  ];

  for (const role of ROLE_CATALOG) {
    lines.push(`| ${role.role} | ${role.responsibility} | ${role.deliverable} |`);
  }

  return lines.join("\n");
}

function renderPlan(goal, name) {
  return `# Growth Plan: ${name}

## Goal
${goal}

## Startup Gates (Must Pass Before Scale)
- [ ] Strategy Gate
- [ ] Compliance Gate
- [ ] Capacity Gate
- [ ] Data Gate
- [ ] Ownership Gate

## Roles and Ownership
${renderRoleTable()}

## Dual-Track Execution

### Visibility Track
- [ ] Query cluster expansion for non-brand visibility
- [ ] AEO answer block rollout for priority clusters
- [ ] SERP feature opportunity capture
- [ ] Authority growth for high-competition clusters

### Quality Track
- [ ] Technical foundation hardening
- [ ] High-intent landing path optimization
- [ ] Schema/entity consistency enforcement
- [ ] Internal link continuity and depth quality

## Cycle Cadence
- Weekly: run operational review and decide continue/intervene/rollback
- Monthly: rebalance cluster investment and refresh/new ratio
- Quarterly: architecture governance review and pattern codification

## Incident Protocol
- P0: immediate rollback + full postmortem
- P1: intervention sprint in next cycle
- P2: backlog remediation with active monitoring

## Execution Checklist (Initial)
- [ ] Complete gate remediation tasks if any gate fails
- [ ] Start campaign only after all gates pass
- [ ] Register module owners and due dates
- [ ] Execute first weekly cycle and produce report
- [ ] Register incidents if threshold breach occurs
`;
}

export function createPlan(projectRoot, goal, customName = "") {
  const runtime = runtimePaths(projectRoot);
  ensureDir(runtime.plansDir);

  const baseName = customName || `${todayStamp()}-${slugify(goal).slice(0, 40)}`;
  const fileName = `${slugify(baseName)}.md`;
  const filePath = path.join(runtime.plansDir, fileName);

  writeTextFile(filePath, renderPlan(goal, baseName));

  return {
    name: baseName,
    fileName,
    filePath,
  };
}

export function listPlans(projectRoot) {
  const runtime = runtimePaths(projectRoot);
  const files = listFiles(runtime.plansDir, (filePath) => filePath.endsWith(".md"));
  return files
    .map((filePath) => ({
      filePath,
      fileName: path.basename(filePath),
      title: readTextFile(filePath, "").split("\n")[0].replace(/^#\s*/, "") || path.basename(filePath, ".md"),
    }))
    .sort((a, b) => a.fileName.localeCompare(b.fileName));
}

export function resolvePlan(projectRoot, planHint = "") {
  const plans = listPlans(projectRoot);
  if (plans.length === 0) return null;

  if (!planHint) {
    return plans[plans.length - 1];
  }

  const normalized = planHint.toLowerCase();
  return (
    plans.find((plan) => plan.fileName.toLowerCase() === normalized) ||
    plans.find((plan) => plan.fileName.toLowerCase().includes(normalized)) ||
    plans.find((plan) => plan.title.toLowerCase().includes(normalized)) ||
    null
  );
}
