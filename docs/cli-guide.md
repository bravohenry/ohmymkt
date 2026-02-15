# ohmymkt CLI Guide

This guide covers practical CLI usage for the marketing workspace.

---

## Core Commands

```bash
# Enter OpenCode session
opencode

# Type check + build
bun run typecheck
bun run build

# Marketing-focused tests
bun test src/tools/ohmymkt/tools.test.ts
bun test src/tools/ohmymkt/contract.test.ts
bun test src/hooks/keyword-detector/ultrawork/source-detector.test.ts
```

---

## Typical Operator Flow

1. Start session: `opencode`
2. Run a marketing goal with `ulw`
3. Review outputs in `.ohmymkt/`
4. Run validation commands

Example prompt:

```text
ulw create a campaign plan for onboarding activation uplift
```

---

## Plan-First Flow

For critical work:

1. ask `growth-manager` for plan draft
2. run planning review loop (`requirements-analyst`, `plan-reviewer`)
3. trigger execution through `execution-manager`
4. verify report and metrics output

---

## Troubleshooting CLI Outcomes

If no campaign state appears:

- verify tool calls include `ohmymkt_*`
- verify current agent topology is marketing
- verify no accidental tool disablement

If image/video/publish steps fail:

- run `ohmymkt_provider_config`
- retry generation/publishing task
