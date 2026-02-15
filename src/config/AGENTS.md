# config/
> L2 | Parent: /Users/henry/PARA/[01] Projects/Vibe/ohmymkt/ohmymkt/AGENTS.md

Members
schema/: Zod schema component set for plugin configuration (agents, categories, hooks, commands, runtime options)
schema.ts: schema export barrel
schema.test.ts: schema validation test suite
types.ts: config type exports
index.ts: public config module export

Architecture Notes
This module defines the single configuration contract consumed by CLI/runtime.
The workspace uses marketing-first defaults (for example `growth-manager` as default run agent) while preserving upstream-compatible config loading semantics.

Development Rules
After schema shape changes, run:
`bun run build:schema`

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
