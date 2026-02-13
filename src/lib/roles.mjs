/**
 * [INPUT]: Depends on role responsibility definitions from docs/seo-aeo-growth-system-2026.md.
 * [OUTPUT]: Exports the unified role catalog (name, responsibility, deliverable).
 * [POS]: Organizational model layer in src/lib, reused by plan generation and report rendering.
 * [PROTOCOL]: Update this header when changed, then check AGENTS.md
 */

export const ROLE_CATALOG = [
  {
    role: "Planner",
    responsibility: "Interview goals, decompose scope, and define execution path",
    deliverable: "Plan file, dependency graph, parallel execution waves",
  },
  {
    role: "Requirements Analyst",
    responsibility: "Find requirement gaps, ambiguity, and missing preconditions",
    deliverable: "Risk list and prerequisite gap list",
  },
  {
    role: "Plan Reviewer",
    responsibility: "Validate plan executability and verifiability",
    deliverable: "Pass/revise decision",
  },
  {
    role: "Execution Manager",
    responsibility: "Dispatch execution, enforce gates, and make rollback decisions",
    deliverable: "Cycle report and incident handling records",
  },
  {
    role: "Technical SEO Engineer",
    responsibility: "Own technical SEO baseline and template health",
    deliverable: "Technical QA report",
  },
  {
    role: "Intent Ops Specialist",
    responsibility: "Own query intent clustering and URL ownership",
    deliverable: "Ownership matrix and cannibalization report",
  },
  {
    role: "Content Ops Manager",
    responsibility: "Own dual-track content throughput and quality",
    deliverable: "Publish package and refresh package",
  },
  {
    role: "AEO Specialist",
    responsibility: "Design answer modules and extractable structures",
    deliverable: "AEO module map",
  },
  {
    role: "Schema & Entity Specialist",
    responsibility: "Own schema governance and entity consistency",
    deliverable: "Schema registry and drift validation output",
  },
  {
    role: "Internal Link Specialist",
    responsibility: "Maintain topical graph and link depth quality",
    deliverable: "Internal link health report",
  },
  {
    role: "Authority & PR Manager",
    responsibility: "Run relevance-first authority growth and outreach",
    deliverable: "Outreach pipeline and quality distribution",
  },
  {
    role: "Growth Analyst",
    responsibility: "Own experiments, attribution, and decision loop",
    deliverable: "Weekly dashboard and experiment decisions",
  },
];
