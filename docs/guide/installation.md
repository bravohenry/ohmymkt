<!--
[INPUT]: Depends on package.json, src/cli.mjs, and baseline resources in templates/.
[OUTPUT]: Exposes executable installation and initialization steps.
[POS]: Environment bootstrap guide in docs/guide for first-time setup and onboarding.
[PROTOCOL]: Update this header when changed, then check AGENTS.md
-->

# Installation

This document explains how to bootstrap `ohmymkt` and validate that the runtime behaves exactly as expected.

---

## 1) Prerequisites

| Requirement | Minimum | Why |
|---|---|---|
| Node.js | `>=18` | Runtime for CLI |
| Shell | `zsh` or `bash` | Command execution |
| Filesystem access | Read/write project workspace | Runtime state and reports |

Validate quickly:

```bash
node --version
```

---

## 2) Workspace Entry

```bash
cd /Users/henry/PARA/[01] Projects/Vibe/ohmymkt/ohmymkt
```

The command examples in this guide assume this as current working directory.

---

## 3) Install Dependencies

```bash
npm install
```

Current project design has no external runtime dependencies, but this step should still be part of standard bootstrap for consistency.

---

## 4) Verify CLI Availability

```bash
node ./src/cli.mjs help
```

Expected behavior:

1. Command exits with code `0`.
2. Help text lists all six primary command groups.

---

## 5) First Plan Creation

```bash
node ./src/cli.mjs plan-growth "Build non-brand growth with AEO capture"
```

Expected output:

- A new markdown plan under `.ohmymkt/plans/`.

Validation command:

```bash
ls -la ./.ohmymkt/plans
```

---

## 6) Gate State Initialization and Check

Run:

```bash
node ./src/cli.mjs check-gates
```

On first run, this should normally return overall `FAIL` because template defaults are conservative.

Generated artifact:

- `.ohmymkt/state/gates.json` (auto-seeded from `templates/gates.template.json`)

Update gate state values manually until pass conditions are met.

Example pass-ready gate state:

```json
{
  "strategy_gate": { "kpi_tree_bound": true, "approved": true },
  "compliance_gate": { "documented": true, "accepted_by_all": true },
  "capacity_gate": { "rolling_weeks_feasible": 8 },
  "data_gate": { "dashboard_stable": true, "reconcilable": true },
  "ownership_gate": { "priority_query_coverage": 0.9 }
}
```

Re-check until overall pass:

```bash
node ./src/cli.mjs check-gates
```

Exit code semantics:

- `0`: all startup gates pass.
- `2`: at least one startup gate fails.

---

## 7) Start Campaign

```bash
node ./src/cli.mjs start-campaign
```

Expected behavior on success:

1. Active plan is attached to runtime state.
2. `.ohmymkt/boulder.json` is created.
3. `.ohmymkt/state/execution.json` is created with both tracks active.
4. `.ohmymkt/state/sprint-board.json` is generated from `task-pool-40.json`.
5. Notepad files are created in `.ohmymkt/notepads/<plan-name>/`.

Expected behavior on failure:

- If gates are not passed, command blocks with status details.

---

## 8) Run First Cycle

```bash
node ./src/cli.mjs run-cycle weekly
```

Generated artifacts:

- `.ohmymkt/reports/weekly/<date>-weekly.md`
- `.ohmymkt/state/cycles.json` appended with decision record

Cadence options:

- `weekly`
- `monthly`
- `quarterly`

---

## 9) Register an Incident

```bash
node ./src/cli.mjs incident --severity P1 --module "aeo_answer_layer" --summary "citation loss on priority cluster"
```

Generated artifact:

- `.ohmymkt/incidents/inc-<timestamp>-p1.json`

Severity constraints:

- Allowed: `P0`, `P1`, `P2`
- Any other severity causes command failure.

---

## 10) Generate Aggregate Report

```bash
node ./src/cli.mjs report-growth --window 30d
```

Generated artifact:

- `.ohmymkt/reports/summary/<date>-30d.md`

Window format:

- Supported: `<N>d` such as `7d`, `30d`, `90d`
- Invalid format falls back to `30d`.

---

## 11) Runtime File Contract (Minimum)

| File | Required fields |
|---|---|
| `state/gates.json` | five startup gate objects with expected keys |
| `state/metrics.json` | `visibility_track`, `quality_track`, `updated_at` |
| `state/execution.json` | `active_plan`, `mode`, `tracks`, `updated_at` |
| `state/sprint-board.json` | task entries with dispatch metadata |
| `state/cycles.json` | cadence decision history |
| `boulder.json` | active plan pointer and start metadata |

---

## 12) Troubleshooting

### `start-campaign` always blocked

Possible causes:

1. One or more startup gates still fail.
2. No plan exists under `.ohmymkt/plans/`.

Fix path:

1. Run `check-gates` and remediate failures.
2. Run `plan-growth` if no plan exists.

### `run-cycle` fails due to cadence

Cause:

- Cadence is not one of `weekly|monthly|quarterly`.

Fix:

- Use supported cadence values only.

### `report-growth` output looks empty

Cause:

- No cycle records or incidents in selected time window.

Fix:

1. Run at least one cycle.
2. Register incidents when applicable.
3. Re-run report with a wider window (for example `90d`).

---

## 13) CI-Friendly Smoke Test

Use this sequence for CI sanity checks:

```bash
node ./src/cli.mjs help
node ./src/cli.mjs plan-growth "CI smoke test"
node ./src/cli.mjs check-gates || true
```

If your CI pipeline expects strict pass, ensure gate fixtures are preloaded before running `start-campaign`.

---

## 14) Operator Checklist

1. Confirm Node runtime.
2. Create or select active plan.
3. Pass all startup gates.
4. Start campaign.
5. Assign sprint board metadata.
6. Run cycle command at required cadence.
7. Register incidents with strict severity discipline.
8. Produce regular summary reports.
