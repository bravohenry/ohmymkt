# ohmymkt Task System

`ohmymkt` task flow tracks marketing execution as a stateful cycle.

---

## Task Levels

1. Plan tasks: objective, scope, acceptance criteria
2. Gate tasks: readiness and risk checks
3. Execution tasks: specialist-owned deliverables
4. Reporting tasks: metrics, findings, next actions

---

## State-Aware Tasks

Tasks are persisted through `ohmymkt_*` tools under `.ohmymkt/`.

Core task lifecycle:

1. create/refresh plan (`ohmymkt_plan_growth`)
2. validate readiness (`ohmymkt_check_gates`)
3. launch/iterate cycle (`ohmymkt_start_campaign`, `ohmymkt_run_cycle`)
4. capture report (`ohmymkt_report_growth`)

---

## Incident Tasks

When incidents happen:

1. create incident record (`ohmymkt_incident`)
2. re-prioritize with `execution-manager`
3. re-run cycle with updated constraints

---

## Task Quality Rules

- every task has owner
- every task has measurable completion condition
- every critical task updates runtime state
