# ohmymkt Orchestration Guide

Practical guide for running marketing work with the `growth-manager` topology.

---

## Quick Decision Matrix

| Situation | Recommended Path | Why |
|---|---|---|
| Quick execution with clear goal | `ultrawork` / `ulw` | Fast autonomous routing |
| High-stakes launch or budget impact | Planned mode (`growth-manager` -> review -> execute) | Stronger validation |
| Ongoing campaign iteration | Start from `ohmymkt_report_growth` and `ohmymkt_run_cycle` | State-aware loop |
| Incident handling | `ohmymkt_incident` + execution-manager follow-up | Controlled recovery |

---

## Canonical Flow

1. Input objective and constraints.
2. `growth-manager` forms initial plan.
3. `requirements-analyst` clarifies requirements.
4. `plan-reviewer` approves/rejects plan.
5. `execution-manager` dispatches specialists.
6. `ohmymkt_*` tools persist plan/gates/cycle/metrics.
7. Return report and next-cycle recommendations.

---

## Ultrawork Flow

Use keyword:

```text
ulw build a 30-day demand-gen pipeline for our B2B SaaS
```

Expected behavior:

- marketing ultrawork source is selected
- planning + review pass runs before heavy execution
- execution is delegated by domain
- runtime state is written under `.ohmymkt/`

---

## Planned Flow (Recommended for Critical Work)

Use this mode when you need strict approval points.

1. Ask `growth-manager` to draft plan.
2. Ask `requirements-analyst` to expose assumptions and missing inputs.
3. Ask `plan-reviewer` to verify acceptance criteria and risks.
4. Approve plan.
5. Trigger execution through `execution-manager`.

Checklist before execution:

- objective is measurable
- channel scope is explicit
- budget/time constraints are explicit
- success criteria are testable
- fallback/incident path exists

---

## Delegation Matrix

| Work Type | Primary Specialist | Typical Tools |
|---|---|---|
| Market/competitor discovery | `research-agent` | `ohmymkt_research_brief`, `ohmymkt_competitor_profile` |
| Positioning and message | `content-writer` + `growth-analyst` | `ohmymkt_save_positioning` |
| SEO/AEO implementation | `seo-engineer` + `aeo-specialist` | `ohmymkt_check_gates`, `ohmymkt_update_gates` |
| Campaign launch and cadence | `content-ops` | `ohmymkt_start_campaign`, `ohmymkt_run_cycle` |
| Reporting and iteration | `growth-analyst` | `ohmymkt_report_growth`, `ohmymkt_update_metrics` |
| Asset and publishing | `content-writer` + `content-ops` | `ohmymkt_asset_manifest`, `ohmymkt_generate_image`, `ohmymkt_generate_video`, `ohmymkt_publish` |

---

## Failure and Recovery

### Plan quality issue

- Route back to `plan-reviewer`
- Patch acceptance criteria and ownership
- re-approve before resuming execution

### Campaign incident

- run `ohmymkt_incident`
- capture severity/impact/status
- re-sequence execution through `execution-manager`

### Missing provider config

- run `ohmymkt_provider_config`
- retry failed generation/publish step

---

## What Not to Do

- Do not bypass planning for high-stakes launches.
- Do not let specialists self-orchestrate cross-domain execution.
- Do not store critical state only in chat text.
- Do not use non-marketing ultrawork prompts in marketing sessions.

---

## Validation Commands

```bash
# Type safety
bun run typecheck

# Build
bun run build

# Focused tests for marketing chain
bun test src/tools/ohmymkt/tools.test.ts
bun test src/tools/ohmymkt/contract.test.ts
bun test src/hooks/keyword-detector/ultrawork/source-detector.test.ts
```

---

## Reference

- `docs/guide/overview.md`
- `docs/guide/understanding-orchestration-system.md`
- `docs/configurations.md`
- `docs/features.md`
