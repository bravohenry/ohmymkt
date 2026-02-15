# ohmymkt Features

This page summarizes the marketing-focused feature set.

---

## 1. Agent Topology

`ohmymkt` uses a layered marketing topology:

- Primary: `growth-manager`
- Planning: `requirements-analyst`, `plan-reviewer`
- Execution: `execution-manager`
- Domain specialists:
  - `aeo-specialist`
  - `content-ops`
  - `content-writer`
  - `growth-analyst`
  - `research-agent`
- `seo-engineer`

This replaces generic coding orchestration with marketing orchestration while keeping upstream OpenCode engine hooks/tooling.

```mermaid
flowchart TB
    GM["growth-manager"] --> RA["requirements-analyst"]
    GM --> PR["plan-reviewer"]
    GM --> EM["execution-manager"]

    EM --> AEO["aeo-specialist"]
    EM --> CO["content-ops"]
    EM --> CW["content-writer"]
    EM --> GA["growth-analyst"]
    EM --> RE["research-agent"]
    EM --> SEO["seo-engineer"]
```

---

## 2. Marketing Runtime Tools

18 native runtime tools are registered via `src/tools/ohmymkt/index.ts`:

1. `ohmymkt_plan_growth`
2. `ohmymkt_check_gates`
3. `ohmymkt_start_campaign`
4. `ohmymkt_run_cycle`
5. `ohmymkt_incident`
6. `ohmymkt_report_growth`
7. `ohmymkt_list_plans`
8. `ohmymkt_update_gates`
9. `ohmymkt_update_metrics`
10. `ohmymkt_read_state`
11. `ohmymkt_research_brief`
12. `ohmymkt_save_positioning`
13. `ohmymkt_asset_manifest`
14. `ohmymkt_provider_config`
15. `ohmymkt_generate_image`
16. `ohmymkt_generate_video`
17. `ohmymkt_publish`
18. `ohmymkt_competitor_profile`

```mermaid
flowchart LR
    IDX["createOhmymktTools()"] --> REG["tool-registry allTools merge"]
    REG --> FIL["filterDisabledTools"]
    FIL --> RUN["Runtime callable toolset"]
```

---

## 3. State and Templates

Runtime state is stored in `.ohmymkt/`.

Template files live under `src/tools/ohmymkt/templates/`:

- `gates.template.json`
- `metrics.template.json`
- `modules.template.json`
- `task-pool-40.json`

```mermaid
flowchart TB
    TMP["templates/*.json"] --> INIT["runtime initializer"]
    INIT --> STATE[".ohmymkt/*"]
    STATE --> CYCLE["plan/gate/cycle/report updates"]
```

---

## 4. Ultrawork (Marketing Route)

Keyword trigger: `ultrawork` / `ulw`

When a marketing primary/planning agent is active, ultrawork uses the marketing injection template and marketing delegation path.

It intentionally avoids legacy non-marketing delegation instructions.

```mermaid
flowchart TD
    K["Keyword detected"] --> S["source-detector"]
    S -->|marketing agents| M["marketing ultrawork template"]
    S -->|others| O["non-marketing templates"]
    M --> P["planning + execution-manager path"]
```

---

## 5. Agent Loader Behavior

Project agents are loaded from `.claude/agents/*.md`.

Loader rules:

- accepts markdown agent files
- ignores `AGENTS.md` and `README.md`
- parses frontmatter extensions:
  - `mode: primary|subagent`
  - `model`
  - `temperature`
  - `tools`

```mermaid
flowchart LR
    F[".claude/agents/*.md"] --> V{"is markdown and not AGENTS/README?"}
    V -->|yes| FM["frontmatter parser"]
    V -->|no| SKIP["skip"]
    FM --> OUT["agent definitions in runtime"]
```

---

## 6. Skill Integration

Project skills in `.opencode/skills/` can call `ohmymkt_*` tools directly.

Contract test ensures all `ohmymkt_*` tokens referenced by agents/skills exist in the registered toolset.

```mermaid
flowchart LR
    SK["skills + agents token scan"] --> CT["contract.test.ts"]
    CT -->|all tokens registered| PASS["pass"]
    CT -->|missing token| FAIL["fail build/test gate"]
```

---

## 7. Compatibility Principle

The fork keeps upstream OpenCode skeleton features (hooks, slash commands, task/background mechanisms).

Customizations are done through native extension points, not runtime bypasses.
