# src/lib/
> L2 | Parent: /Users/henry/PARA/[01] Projects/Vibe/ohmymkt/ohmymkt/src/AGENTS.md

Member list
constants.mjs: Runtime paths and shared constants
io.mjs: Filesystem I/O helpers and JSON persistence
roles.mjs: Functional role registry for Planner/Reviewer/Execution/Domain specialists
gates.mjs: Go/No-Go evaluation engine and gate status reporting
plans.mjs: Plan generation and plan discovery
campaign.mjs: Campaign start/resume state machine with gate enforcement
cycle.mjs: Weekly/monthly/quarterly execution cycle and decision engine
incidents.mjs: P0/P1/P2 incident registration and query
reports.mjs: Aggregated growth reporting over cycle + incident data

Rule: single responsibility, composable modules, and data-driven behavior.

[PROTOCOL]: Update this header when changed, then check AGENTS.md
