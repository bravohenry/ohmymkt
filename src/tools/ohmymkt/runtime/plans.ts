/**
 * [INPUT]: Role catalog, gate rules, runtime paths
 * [OUTPUT]: Plan creation, listing, resolution, renderPlan, renderRoleTable
 * [POS]: Planning layer that captures structured Planner output
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import path from "node:path";
import { ROLE_CATALOG } from "./roles";
import { runtimePaths } from "./constants";
import { ensureDir, writeTextFile, listFiles, readTextFile, slugify, todayStamp } from "./io";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface PlanInfo {
  filePath: string;
  fileName: string;
  title: string;
}

export interface PlanCreateResult {
  name: string;
  fileName: string;
  filePath: string;
}

/* ------------------------------------------------------------------ */
/*  Renderers (exported for tool layer)                                */
/* ------------------------------------------------------------------ */

export function renderRoleTable(): string {
  const lines = [
    "| Role | Responsibility | Deliverable |",
    "|---|---|---|",
  ];
  for (const role of ROLE_CATALOG) {
    lines.push(`| ${role.role} | ${role.responsibility} | ${role.deliverable} |`);
  }
  return lines.join("\n");
}

export function renderPlan(goal: string, name: string): string {
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

/* ------------------------------------------------------------------ */
/*  CRUD operations                                                    */
/* ------------------------------------------------------------------ */

export function createPlan(
  projectRoot: string,
  goal: string,
  customName: string = "",
): PlanCreateResult {
  const runtime = runtimePaths(projectRoot);
  ensureDir(runtime.plansDir);

  const baseName = customName || `${todayStamp()}-${slugify(goal).slice(0, 40)}`;
  const fileName = `${slugify(baseName)}.md`;
  const filePath = path.join(runtime.plansDir, fileName);

  writeTextFile(filePath, renderPlan(goal, baseName));
  return { name: baseName, fileName, filePath };
}

export function listPlans(projectRoot: string): PlanInfo[] {
  const runtime = runtimePaths(projectRoot);
  const files = listFiles(runtime.plansDir, (fp) => fp.endsWith(".md"));
  return files
    .map((fp) => ({
      filePath: fp,
      fileName: path.basename(fp),
      title: readTextFile(fp, "").split("\n")[0].replace(/^#\s*/, "") || path.basename(fp, ".md"),
    }))
    .sort((a, b) => a.fileName.localeCompare(b.fileName));
}

export function resolvePlan(projectRoot: string, planHint: string = ""): PlanInfo | null {
  const plans = listPlans(projectRoot);
  if (plans.length === 0) return null;
  if (!planHint) return plans[plans.length - 1];

  const normalized = planHint.toLowerCase();
  return (
    plans.find((p) => p.fileName.toLowerCase() === normalized) ||
    plans.find((p) => p.fileName.toLowerCase().includes(normalized)) ||
    plans.find((p) => p.title.toLowerCase().includes(normalized)) ||
    null
  );
}
