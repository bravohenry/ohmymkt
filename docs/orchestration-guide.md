# ohmymkt Orchestration Guide

Operator runbook for marketing execution with the `growth-manager` topology.

---

## 1. Decision Entry

```mermaid
flowchart TD
    S["Start"] --> D1{"Task impact high?<br/>(budget, launch date, revenue)"}
    D1 -->|No| D2{"Need fast autonomous execution?"}
    D1 -->|Yes| PL["Planned Mode"]

    D2 -->|Yes| UW["Ultrawork Mode (ulw)"]
    D2 -->|No| PL

    UW --> E["execution-manager path"]
    PL --> P["requirements + review gate"]
    P --> E
    E --> R["report + next-cycle actions"]
```

---

## 2. Mode Comparison

| Mode | Trigger | Planning Strictness | Best For | Risk Level |
|---|---|---|---|---|
| Ultrawork | `ultrawork` / `ulw` keyword | medium-to-high (template-driven) | fast iteration, broad discovery | medium |
| Planned | explicit planning/review sequence | highest | launches, paid channels, high-cost execution | low |

---

## 3. Canonical Execution Path

```mermaid
sequenceDiagram
    participant U as User
    participant GM as growth-manager
    participant RA as requirements-analyst
    participant PR as plan-reviewer
    participant EM as execution-manager
    participant SP as specialist agents
    participant TO as ohmymkt_* tools

    U->>GM: objective + constraints
    GM->>RA: clarify requirements
    RA-->>GM: acceptance criteria
    GM->>PR: review plan quality
    PR-->>GM: approve/reject
    alt rejected
      GM->>RA: revise scope/criteria
      RA-->>GM: revised package
      GM->>PR: re-review
      PR-->>GM: approve
    end
    GM->>EM: approved execution packet
    EM->>SP: delegate domain tasks
    SP->>TO: stateful operations
    TO-->>EM: state + outputs
    EM-->>U: progress + report + next actions
```

---

## 4. Ultrawork Path Internals

Use prompt:

```text
ulw build a 30-day demand-gen pipeline for our B2B SaaS
```

Router behavior:

```mermaid
flowchart LR
    I["Prompt"] --> K{"contains ulw/ultrawork?"}
    K -->|No| N["normal route"]
    K -->|Yes| SR["source-detector"]
    SR -->|marketing agents| MT["marketing template"]
    SR -->|other agents| OT["other template branches"]
    MT --> GM["growth-manager flow"]
```

Guarantee:

- marketing ultrawork branch does not inject disabled legacy agents

---

## 5. Planned Mode Checklist

Before dispatching execution, confirm all of the following:

1. objective has measurable outcome
2. channels and boundaries are explicit
3. timeline and budget are explicit
4. acceptance criteria are testable
5. rollback/incident route exists
6. owner is assigned per deliverable

If any item fails, send back to `requirements-analyst` and `plan-reviewer`.

---

## 6. Delegation Matrix

| Workstream | Primary Specialist | Supporting Specialist | Typical Tools |
|---|---|---|---|
| Market discovery | `research-agent` | `growth-analyst` | `ohmymkt_research_brief`, `ohmymkt_competitor_profile` |
| Positioning | `content-writer` | `growth-analyst` | `ohmymkt_save_positioning` |
| AEO/SEO implementation | `seo-engineer` | `aeo-specialist` | `ohmymkt_check_gates`, `ohmymkt_update_gates` |
| Campaign operations | `content-ops` | `growth-manager` | `ohmymkt_start_campaign`, `ohmymkt_run_cycle` |
| Performance loop | `growth-analyst` | `execution-manager` | `ohmymkt_update_metrics`, `ohmymkt_report_growth` |
| Asset + distribution | `content-writer` | `content-ops` | `ohmymkt_asset_manifest`, `ohmymkt_generate_image`, `ohmymkt_generate_video`, `ohmymkt_publish` |

---

## 7. Incident Runbook

```mermaid
flowchart TD
    X["Incident detected"] --> I1["ohmymkt_incident (open)"]
    I1 --> I2{"Severity"}
    I2 -->|high| H["pause risky tasks"]
    I2 -->|medium/low| M["continue guarded tasks"]
    H --> R1["execution-manager resequence"]
    M --> R1
    R1 --> R2["mitigation actions by specialists"]
    R2 --> I3["ohmymkt_incident (resolved/update)"]
    I3 --> I4["ohmymkt_run_cycle"]
    I4 --> I5["ohmymkt_report_growth"]
```

---

## 8. Provider Failure Runbook

```mermaid
sequenceDiagram
    participant EM as execution-manager
    participant T as generation/publish tool
    participant P as ohmymkt_provider_config

    EM->>T: generate/publish request
    T-->>EM: provider missing/misconfigured
    EM->>P: set/update provider config
    P-->>EM: config persisted
    EM->>T: retry request
    T-->>EM: success/fail result
```

Escalation rule:

- retry once after configuration fix
- if still failing, continue cycle without blocked channel and surface incident

---

## 9. Weekly Cycle Timeline

```mermaid
flowchart LR
    W0["Week Start"] --> P["plan_growth / list_plans"]
    P --> G["check_gates"]
    G --> C["start_campaign / run_cycle"]
    C --> A["asset + publish operations"]
    A --> M["update_metrics"]
    M --> R["report_growth"]
    R --> N["next cycle priorities"]
    N --> W0
```

---

## 10. Anti-Patterns

- bypassing review gates for high-cost launches
- letting specialists self-orchestrate cross-domain sequencing
- keeping campaign truth only in chat text (no runtime state write)
- mixing non-marketing ultrawork templates into marketing sessions

---

## 11. Validation Commands

```bash
# build safety
bun run typecheck
bun run build

# marketing contract checks
bun test src/features/claude-code-agent-loader/loader.test.ts
bun test src/tools/ohmymkt/tools.test.ts
bun test src/tools/ohmymkt/contract.test.ts
bun test src/hooks/keyword-detector/ultrawork/source-detector.test.ts
```

---

## 12. References

- `docs/guide/overview.md`
- `docs/guide/understanding-orchestration-system.md`
- `docs/configurations.md`
- `docs/features.md`
