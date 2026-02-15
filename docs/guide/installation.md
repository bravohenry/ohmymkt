# ohmymkt Installation Guide

This guide sets up the marketing-oriented fork in a local OpenCode workflow.

---

## 1. Prerequisites

- Bun runtime installed
- OpenCode installed
- Access to this repository

---

## 2. Install Dependencies

```bash
bun install
```

---

## 3. Validate Build

```bash
bun run typecheck
bun run build
```

---

## 4. Project-Level Config

Place a project config in `.opencode/` for marketing defaults.

Recommended baseline:

```json
{
  "default_run_agent": "growth-manager",
  "sisyphus_agent": { "disabled": true },
  "disabled_agents": [
    "oracle",
    "librarian",
    "explore",
    "plan"
  ]
}
```

---

## 5. Verify Agent Topology

Check `.claude/agents/` contains:

- `growth-manager` (primary)
- `requirements-analyst`
- `plan-reviewer`
- `execution-manager`
- 6 domain specialists

Also ensure `AGENTS.md` is documentation only and not loaded as an executable agent.

---

## 6. Verify Tool Wiring

Run focused tests:

```bash
bun test src/features/claude-code-agent-loader/loader.test.ts
bun test src/tools/ohmymkt/tools.test.ts
bun test src/tools/ohmymkt/contract.test.ts
bun test src/hooks/keyword-detector/ultrawork/source-detector.test.ts
```

Expected outcome:

- 18 `ohmymkt_*` tools registered
- agent loader ignores `AGENTS.md`
- marketing ultrawork source routing active

---

## 7. Smoke Run

Start OpenCode and run:

```text
ulw create a 2-week activation campaign plan and execution checklist
```

Validate:

- marketing agents are selected
- no legacy non-marketing agent injection in ultrawork path
- `.ohmymkt/` state files are created/updated

---

## 8. Optional Provider Setup

If image/video/publish features are needed, configure providers via:

- `ohmymkt_provider_config`

Then rerun generation/publishing steps.
