# ohmymkt CLI Guide

---

## 1. Overview

`ohmymkt` currently uses the upstream CLI binary name:

- `bunx oh-my-opencode`

This CLI provides installation, diagnostics, session execution, version checks, and MCP OAuth management.

```bash
# Basic execution (displays help)
bunx oh-my-opencode

# Alternative
npx oh-my-opencode
```

---

## 2. Available Commands

| Command | Purpose |
|---|---|
| `install` | interactive/non-interactive setup |
| `run <message>` | run an OpenCode session with completion enforcement |
| `doctor` | environment/config/health diagnostics |
| `get-local-version` | show local vs latest version |
| `version` | print current plugin version |
| `mcp oauth` | OAuth login/logout/status for MCP servers |

---

## 3. `install` - Interactive Setup Wizard

### Usage

```bash
bunx oh-my-opencode install
bunx oh-my-opencode install --no-tui --claude=yes --gemini=no --copilot=no
```

### Installation Process

1. collect provider/subscription inputs
2. create/update plugin config
3. ensure plugin registration in OpenCode config
4. provide auth setup guidance

### Options

| Option | Description |
|---|---|
| `--no-tui` | non-interactive mode |
| `--claude <no|yes|max20>` | Claude subscription info |
| `--openai <no|yes>` | OpenAI subscription info |
| `--gemini <no|yes>` | Gemini availability |
| `--copilot <no|yes>` | Copilot availability |
| `--opencode-zen <no|yes>` | OpenCode Zen availability |
| `--zai-coding-plan <no|yes>` | Z.ai plan availability |
| `--kimi-for-coding <no|yes>` | Kimi plan availability |
| `--skip-auth` | skip auth setup hints |

---

## 4. `doctor` - Environment Diagnostics

### Usage

```bash
bunx oh-my-opencode doctor
bunx oh-my-opencode doctor --verbose
bunx oh-my-opencode doctor --json
bunx oh-my-opencode doctor --category configuration
```

### Diagnostic Categories

| Category | Checks |
|---|---|
| `installation` | OpenCode/plugin installation health |
| `configuration` | config validity and model resolution |
| `authentication` | provider auth states |
| `dependencies` | external binaries/dependencies |
| `tools` | LSP/MCP/tooling availability |
| `updates` | version/update checks |

### Options

| Option | Description |
|---|---|
| `--verbose` | detailed diagnostic output |
| `--json` | machine-readable output |
| `--category <name>` | run a single category |

### Example Output Focus

- config file found/missing
- schema parse pass/fail
- provider auth status
- model resolution hints

---

## 5. `run` - OpenCode Session Runner

### Usage

```bash
bunx oh-my-opencode run "build a campaign launch checklist"
bunx oh-my-opencode run --agent growth-manager "ulw launch SEO sprint"
bunx oh-my-opencode run --json "ulw generate weekly growth report"
```

### Key Behavior

`run` waits for task/background completion conditions, unlike a bare fire-and-forget call.

### Options

| Option | Description |
|---|---|
| `-a, --agent <name>` | explicit agent |
| `-d, --directory <path>` | working directory |
| `-t, --timeout <ms>` | timeout |
| `-p, --port <port>` | attach/start server on port |
| `--attach <url>` | attach existing server |
| `--on-complete <cmd>` | shell command after completion |
| `--json` | structured output |
| `--session-id <id>` | resume existing session |

### Agent Resolution Order

1. `--agent`
2. `OPENCODE_DEFAULT_AGENT`
3. `default_run_agent` in plugin config
4. built-in fallback

In marketing workspaces, set `default_run_agent` to `growth-manager`.

---

## 6. `mcp oauth` - MCP OAuth Management

### Usage

```bash
# Login
bunx oh-my-opencode mcp oauth login <server-name> --server-url https://api.example.com

# Logout
bunx oh-my-opencode mcp oauth logout <server-name>

# Status
bunx oh-my-opencode mcp oauth status [server-name]
```

### Options

OAuth subcommands support server URL/client/scopes options depending on command.

### Token Storage

Tokens are persisted in the OpenCode config area (permissions should stay restrictive).

---

## 7. `auth` Command Note

Some historical docs mention `auth login/logout/status` shortcuts.

Current CLI in this workspace uses explicit `mcp oauth` management for OAuth-enabled MCP paths.

---

## 8. Configuration Files

### Plugin Config

Runtime currently reads:

- `.opencode/oh-my-opencode.json` (project)
- `~/.config/opencode/oh-my-opencode.json` (user)

Branding alias file:

- `.opencode/ohmymkt.json` (optional mirror)

### JSONC Support

`.jsonc` variants are supported where config loader accepts them.

---

## 9. Troubleshooting

### "Plugin not registered"

```bash
bunx oh-my-opencode install
```

### "Config parse/schema failure"

```bash
bunx oh-my-opencode doctor --category configuration --verbose
```

### "Auth issues"

```bash
bunx oh-my-opencode doctor --category authentication --verbose
```

### "Model resolution mismatch"

- inspect `doctor --verbose`
- verify agent/category overrides
- ensure provider auth and model availability

---

## 10. Non-Interactive / CI Mode

```bash
bunx oh-my-opencode doctor --json > doctor-report.json
bunx oh-my-opencode run --json "ulw run weekly growth cycle" > run-report.json
```

Use JSON outputs for CI parsing and alerting.

---

## 11. Developer Information

### CLI Structure

- entry: `src/cli/index.ts`
- command wiring: `src/cli/cli-program.ts`
- install flow: `src/cli/install.ts` and installer modules
- doctor checks: `src/cli/doctor/checks/*`
- run flow: `src/cli/run/*`
- oauth: `src/cli/mcp-oauth/*`

### Adding New Doctor Checks

1. add new check file in `src/cli/doctor/checks/`
2. register definition in checks index
3. verify category filtering and JSON output behavior

---

## 12. Marketing Operator Patterns

### Fast Lane

```bash
bunx oh-my-opencode run --agent growth-manager "ulw run this week's activation cycle"
```

### Controlled Lane

```bash
bunx oh-my-opencode run --agent growth-manager "draft plan, route to requirements-analyst and plan-reviewer first"
```

### Incident Lane

```bash
bunx oh-my-opencode run --agent execution-manager "log incident, resequence tasks, rerun cycle"
```
