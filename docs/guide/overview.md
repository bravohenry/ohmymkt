# ohmymkt Overview

`ohmymkt` is a marketing-first OpenCode plugin workspace.
It keeps upstream engine semantics, but swaps in a marketing orchestration topology and runtime.

---

## TL;DR

- Primary orchestrator: `growth-manager`
- Planning gate: `requirements-analyst` + `plan-reviewer`
- Execution hub: `execution-manager`
- Specialist layer: `aeo-specialist`, `content-ops`, `content-writer`, `growth-analyst`, `research-agent`, `seo-engineer`
- Unified runtime tools: 18 `ohmymkt_*` tools
- Runtime persistence root: `.ohmymkt/`
- Fast autonomous trigger: `ultrawork` / `ulw`

---

## Full System Map

```mermaid
flowchart TB
    U["User Intent"] --> IN["Prompt + Context"]
    IN --> KD["Keyword Detector"]
    KD -->|contains ulw/ultrawork| UW["Ultrawork Route: marketing"]
    KD -->|regular flow| GM["growth-manager (primary)"]
    UW --> GM

    subgraph PL["Planning Layer"]
      GM --> RA["requirements-analyst"]
      GM --> PR["plan-reviewer"]
      RA --> GM
      PR --> GM
    end

    GM --> AP["Approved Plan"]
    AP --> EM["execution-manager"]

    subgraph DSL["Domain Specialist Layer"]
      EM --> AEO["aeo-specialist"]
      EM --> CO["content-ops"]
      EM --> CW["content-writer"]
      EM --> GA["growth-analyst"]
      EM --> RE["research-agent"]
      EM --> SEO["seo-engineer"]
    end

    DSL --> TOOLS["ohmymkt_* Tool Registry"]
    TOOLS --> RT[".ohmymkt Runtime State"]
    RT --> REP["Growth Report + Next Actions"]
    REP --> U
```

---

## Runtime Integration View

```mermaid
flowchart LR
    A[".claude/agents/*.md"] --> L["Agent Loader"]
    S[".opencode/skills/*"] --> SC["Skill Loader"]
    C[".opencode/oh-my-opencode.json or .opencode/ohmymkt.json"] --> CFG["Config Resolver"]

    L --> REG["Core Registry Assembly"]
    SC --> REG
    CFG --> REG

    REG --> TR["Tool Registry (core + ohmymkt)"]
    TR --> FDT["filterDisabledTools"]
    FDT --> EXE["Agent Execution"]

    EXE --> OR["ohmymkt_* runtime calls"]
    OR --> FS[".ohmymkt/* files"]
```

Key point: `ohmymkt` extends through native registry points, not side channels.

---

## Mode Routing Matrix

```mermaid
flowchart TD
    P["Incoming Prompt"] --> Q1{"Contains<br/>ultrawork / ulw ?"}
    Q1 -->|No| Q2{"Active primary = growth-manager ?"}
    Q1 -->|Yes| MKT["Marketing Ultrawork Template"]

    Q2 -->|Yes| GMF["growth-manager planning flow"]
    Q2 -->|No| STD["Standard upstream route"]

    MKT --> GMF
    GMF --> Q3{"Plan approved?"}
    Q3 -->|No| REV["requirements-analyst / plan-reviewer loop"]
    Q3 -->|Yes| EX["execution-manager dispatch"]
    REV --> Q3
    EX --> DONE["State update + report"]
```

---

## Tool Families and Responsibilities

```mermaid
flowchart TB
    subgraph F1["Plan & Gate"]
      T1["ohmymkt_plan_growth"]
      T2["ohmymkt_check_gates"]
      T3["ohmymkt_update_gates"]
    end

    subgraph F2["Launch & Cycle"]
      T4["ohmymkt_start_campaign"]
      T5["ohmymkt_run_cycle"]
      T6["ohmymkt_incident"]
    end

    subgraph F3["State & Report"]
      T7["ohmymkt_read_state"]
      T8["ohmymkt_update_metrics"]
      T9["ohmymkt_report_growth"]
      T10["ohmymkt_list_plans"]
    end

    subgraph F4["Research, Assets, Publish"]
      T11["ohmymkt_research_brief"]
      T12["ohmymkt_competitor_profile"]
      T13["ohmymkt_save_positioning"]
      T14["ohmymkt_asset_manifest"]
      T15["ohmymkt_generate_image"]
      T16["ohmymkt_generate_video"]
      T17["ohmymkt_publish"]
      T18["ohmymkt_provider_config"]
    end

    F1 --> FS[".ohmymkt state files"]
    F2 --> FS
    F3 --> FS
    F4 --> FS
```

---

## Runtime State Model

```mermaid
stateDiagram-v2
    [*] --> DraftPlan: plan_growth
    DraftPlan --> GateCheck: check_gates
    GateCheck --> RevisePlan: gate_failed
    RevisePlan --> DraftPlan
    GateCheck --> CampaignReady: gate_passed
    CampaignReady --> ActiveCampaign: start_campaign
    ActiveCampaign --> ActiveCampaign: run_cycle
    ActiveCampaign --> Incident: incident
    Incident --> ActiveCampaign: mitigated
    ActiveCampaign --> Reporting: report_growth
    Reporting --> NextPlan: update_metrics + list_plans
    NextPlan --> DraftPlan
```

---

## Operational Modes

### Mode A: Ultrawork (fast autonomous)

Prompt example:

```text
ulw launch a 4-week content + SEO growth sprint for our product
```

Behavior:

1. marketing ultrawork template is injected
2. `growth-manager` frames objective/constraints
3. planning gate loop runs
4. `execution-manager` dispatches specialists
5. tools persist state and return measurable report

### Mode B: Planned (high-control)

Use for launch-critical or budget-sensitive work.

1. draft plan via `growth-manager`
2. harden requirements via `requirements-analyst`
3. approve/reject via `plan-reviewer`
4. execute via `execution-manager`

---

## Next Steps

- [Understanding the Orchestration System](./understanding-orchestration-system.md)
- [Orchestration Guide](../orchestration-guide.md)
- [Configurations](../configurations.md)
- [Features](../features.md)
- [Installation](./installation.md)
