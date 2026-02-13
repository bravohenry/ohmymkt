/**
 * [INPUT]: Workflow mode definitions for growth-manager orchestration
 * [OUTPUT]: ROLE_CATALOG array and Role type
 * [POS]: Organizational model layer — 3 workflow modes for growth-manager, specialist work delegated to sub-agents
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface Role {
  role: string;
  responsibility: string;
  deliverable: string;
}

/* ------------------------------------------------------------------ */
/*  Catalog                                                            */
/* ------------------------------------------------------------------ */

export const ROLE_CATALOG: Role[] = [
  {
    role: "Planner",
    responsibility: "Interview goals, find requirement gaps, decompose scope, define execution path",
    deliverable: "Plan file with dependency graph, risk list, and parallel execution waves",
  },
  {
    role: "Reviewer",
    responsibility: "Validate plan executability, check preconditions, make pass/revise decisions",
    deliverable: "Pass/revise decision with actionable feedback",
  },
  {
    role: "Executor",
    responsibility: "Dispatch work to sub-agents, enforce gates, run cycles, handle incidents, make continue/intervene/rollback decisions",
    deliverable: "Cycle reports, incident records, and delegation logs",
  },
];
