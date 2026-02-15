# ohmymkt Configurations

This guide covers configuration relevant to the marketing topology.

---

## Config Scope

Configuration resolution follows standard OpenCode order:

1. project-level config in `.opencode/`
2. user-level config in `~/.config/opencode/`
3. built-in defaults

For branding consistency, use `ohmymkt` naming in project docs and team conventions.

```mermaid
flowchart LR
    P["Project config"] --> R["Config resolver"]
    U["User config"] --> R
    D["Defaults"] --> R
    R --> E["Effective runtime config"]
```

---

## Recommended Project Config (Marketing)

Use a project config that:

- sets `growth-manager` as default run agent
- disables non-marketing agents in this workspace
- preserves required hooks/tool infrastructure

Example:

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

```mermaid
flowchart TB
    C["Config"] --> A1["default_run_agent=growth-manager"]
    C --> A2["sisyphus_agent.disabled=true"]
    C --> A3["disabled_agents includes legacy non-marketing agents"]
    A1 --> E["marketing-first runtime"]
    A2 --> E
    A3 --> E
```

---

## Agent Frontmatter Extensions

Project agents in `.claude/agents/*.md` support:

- `mode?: "primary" | "subagent"`
- `model?: string`
- `temperature?: number`
- `tools?: string[]`

Use these to keep execution behavior explicit at agent definition level.

```mermaid
flowchart LR
    MD["agent markdown"] --> FM["frontmatter"]
    FM --> M["mode"]
    FM --> MDL["model"]
    FM --> TMP["temperature"]
    FM --> TLS["tools"]
    M --> CFG["effective agent config"]
    MDL --> CFG
    TMP --> CFG
    TLS --> CFG
```

---

## Tool Gating

Marketing tools are registered through the main tool registry.

You can still control availability with `disabled_tools` using exact tool names (for example `ohmymkt_publish`).

```mermaid
flowchart TD
    ALL["all registered tools"] --> F{"disabled_tools contains name?"}
    F -->|yes| OFF["removed from runtime set"]
    F -->|no| ON["available in runtime set"]
```

---

## Provider Settings

External providers used by image/video/publish tools are configured via:

- `ohmymkt_provider_config`

This keeps secrets and provider routing out of agent prompt text.

```mermaid
flowchart LR
    OP["operator config action"] --> PC["ohmymkt_provider_config"]
    PC --> ST["provider state persisted"]
    ST --> TL["generate_image / generate_video / publish tools"]
```

---

## Runtime Directories

- marketing runtime state: `.ohmymkt/`
- planning/task artifacts: engine-managed state directories

```mermaid
flowchart TB
    RT[".ohmymkt/"] --> P["plans"]
    RT --> G["gates"]
    RT --> C["campaign state"]
    RT --> M["metrics/report artifacts"]
    RT --> A["asset manifests"]
```

---

## Validation

After config changes:

```bash
bun run typecheck
bun run build
bun test src/features/claude-code-agent-loader/loader.test.ts
bun test src/tools/ohmymkt/tools.test.ts
bun test src/tools/ohmymkt/contract.test.ts
```
