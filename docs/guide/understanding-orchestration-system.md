# Understanding the Marketing Orchestration System

This document is the architecture-level contract for `ohmymkt`.
It describes runtime routing, role boundaries, state transitions, and failure handling.

---

## 1. System Purpose

`ohmymkt` converts open-ended user prompts into controlled growth execution by enforcing:

1. planning quality gates
2. execution ownership boundaries
3. stateful runtime persistence
4. measurable reporting loops

---

## 2. End-to-End Topology

```mermaid
flowchart TB
    U["User"] --> MSG["Prompt"]
    MSG --> KD["Keyword Detector"]
    KD -->|ulw/ultrawork| UWM["Ultrawork Source Router"]
    KD -->|normal prompt| GM["growth-manager"]

    UWM -->|source=marketing| GM

    subgraph PLAN["Planning Layer"]
      GM --> RA["requirements-analyst"]
      GM --> PR["plan-reviewer"]
      RA --> GM
      PR --> GM
    end

    GM -->|approved plan| EM["execution-manager"]

    subgraph EXEC["Domain Specialist Layer"]
      EM --> AEO["aeo-specialist"]
      EM --> CO["content-ops"]
      EM --> CW["content-writer"]
      EM --> GA["growth-analyst"]
      EM --> RE["research-agent"]
      EM --> SEO["seo-engineer"]
    end

    EXEC --> TR["Tool Registry"]
    TR --> ORT["18 ohmymkt_* tools"]
    ORT --> FS[".ohmymkt/*"]
    FS --> OUT["report + next cycle actions"]
    OUT --> U
```

---

## 3. Ultrawork Source Routing Contract

```mermaid
flowchart LR
    IN["Current agent name"] --> R{"source-detector"}
    R -->|growth-manager| M["marketing"]
    R -->|execution-manager| M
    R -->|plan-reviewer| M
    R -->|requirements-analyst| M
    R -->|other agent| O["existing non-marketing branches"]
    M --> T["marketing ultrawork template"]
    T --> C["No oracle/librarian/explore/plan injection"]
```

Behavioral guarantee:

- marketing sessions only receive marketing hierarchy instructions
- disabled legacy agents are not reintroduced through template text

---

## 4. Layer Responsibilities and Boundaries

## 4.1 Planning Layer

### `growth-manager`

- owns objective framing, priority, and scope boundaries
- chooses whether to iterate planning or proceed to execution
- is final planner authority before execution handoff

### `requirements-analyst`

- converts user intent to explicit requirements
- extracts dependencies, constraints, and unknowns
- writes measurable acceptance criteria

### `plan-reviewer`

- validates completeness and coherence
- rejects plans with ambiguous ownership or unverifiable outcomes
- gates execution entry

Planning invariant:

- no execution dispatch without clear acceptance criteria and ownership mapping

## 4.2 Execution Layer

### `execution-manager`

- turns approved plan into delegated specialist tasks
- sequences tasks by dependency and cadence
- owns runtime tool orchestration (`ohmymkt_*`)
- consolidates output into operator-facing report

Execution invariant:

- stateful actions must go through runtime tools, not free-form text memory

## 4.3 Domain Specialist Layer

- `aeo-specialist`: answer engine discoverability and retrieval-safe formatting
- `content-ops`: editorial workflow, channel scheduling, publishing cadence
- `content-writer`: copy asset creation (text/image/video prompts and drafts)
- `growth-analyst`: metrics diagnosis, hypothesis ranking, iteration decisions
- `research-agent`: market signal collection and competitor intelligence
- `seo-engineer`: technical SEO, structure, schema, indexability

Specialist invariant:

- specialists execute domain tasks; they do not redefine orchestration policy

---

## 5. Tool Contract and Family Graph

```mermaid
flowchart TB
    subgraph PF["Plan Family"]
      P1["ohmymkt_plan_growth"]
      P2["ohmymkt_list_plans"]
    end

    subgraph GF["Gate Family"]
      G1["ohmymkt_check_gates"]
      G2["ohmymkt_update_gates"]
    end

    subgraph CF["Campaign Family"]
      C1["ohmymkt_start_campaign"]
      C2["ohmymkt_run_cycle"]
      C3["ohmymkt_incident"]
    end

    subgraph SF["State & Metrics Family"]
      S1["ohmymkt_read_state"]
      S2["ohmymkt_update_metrics"]
      S3["ohmymkt_report_growth"]
    end

    subgraph RF["Research & Positioning Family"]
      R1["ohmymkt_research_brief"]
      R2["ohmymkt_competitor_profile"]
      R3["ohmymkt_save_positioning"]
    end

    subgraph AF["Asset & Publish Family"]
      A1["ohmymkt_asset_manifest"]
      A2["ohmymkt_generate_image"]
      A3["ohmymkt_generate_video"]
      A4["ohmymkt_publish"]
      A5["ohmymkt_provider_config"]
    end

    PF --> ST[".ohmymkt state"]
    GF --> ST
    CF --> ST
    SF --> ST
    RF --> ST
    AF --> ST
```

Tooling invariant:

- all agent/skill `ohmymkt_*` tokens must resolve to registered tools (contract test enforced)

---

## 6. Runtime State Objects

`ohmymkt` persists under `.ohmymkt/` with template-backed initialization.

Primary object groups:

- plans and active plan references
- gates and gate decision history
- campaign lifecycle status
- metrics snapshots and derived reports
- positioning and asset manifests
- provider configuration pointers

---

## 7. Planning State Machine

```mermaid
stateDiagram-v2
    [*] --> Intake
    Intake --> RequirementDraft: growth-manager
    RequirementDraft --> GapClarification: requirements-analyst
    GapClarification --> PlanDraft
    PlanDraft --> ReviewerCheck: plan-reviewer
    ReviewerCheck --> PlanDraft: rejected
    ReviewerCheck --> Approved: approved
    Approved --> [*]
```

Transition rule:

- `PlanDraft -> Approved` only through `ReviewerCheck: approved`

---

## 8. Execution Orchestration Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant GM as growth-manager
    participant RA as requirements-analyst
    participant PR as plan-reviewer
    participant EM as execution-manager
    participant DS as Specialist Agent
    participant RT as ohmymkt_* Tool
    participant ST as .ohmymkt State

    U->>GM: objective + constraints
    GM->>RA: extract requirements
    RA-->>GM: requirements + acceptance criteria
    GM->>PR: validate plan
    PR-->>GM: approve/reject
    alt rejected
      GM->>RA: revise requirements/criteria
      RA-->>GM: revised inputs
      GM->>PR: re-review
      PR-->>GM: approve
    end
    GM->>EM: approved plan + task graph
    par specialist delegation
      EM->>DS: domain task A
      EM->>DS: domain task B
      EM->>DS: domain task C
    end
    DS->>RT: execute runtime action
    RT->>ST: persist state mutation
    ST-->>EM: updated state
    EM-->>U: cycle report + next actions
```

---

## 9. Campaign Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> Planned: plan_growth
    Planned --> Gated: check_gates(pass)
    Planned --> Planned: check_gates(fail) + update_gates
    Gated --> Active: start_campaign
    Active --> Active: run_cycle
    Active --> IncidentOpen: incident(open)
    IncidentOpen --> Mitigating: execution-manager reroute
    Mitigating --> Active: incident(resolved)
    Active --> Reporting: report_growth
    Reporting --> Planned: next cycle planning
```

---

## 10. Failure and Recovery Loop

```mermaid
flowchart TD
    F["Failure Signal"] --> T{"Failure Type"}
    T -->|plan ambiguity| P["route to requirements-analyst + plan-reviewer"]
    T -->|gate failure| G["update_gates + re-check"]
    T -->|execution blockage| E["execution-manager re-sequence"]
    T -->|provider missing| V["provider_config + retry"]
    T -->|incident| I["incident record + mitigation plan"]

    P --> R["re-enter planning"]
    G --> R
    E --> X["resume cycle"]
    V --> X
    I --> X

    R --> X
    X --> O["report updated status"]
```

---

## 11. Non-Negotiable Guardrails

- planning must produce measurable acceptance criteria
- plan approval must precede multi-domain execution
- critical mutations must be written via runtime tools
- marketing ultrawork must not inject disabled legacy agents
- specialist outputs must feed back into shared state before reporting

These constraints keep autonomous behavior deterministic enough for repeated campaign operation.
