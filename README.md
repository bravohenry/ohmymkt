<!--
[INPUT]: Depends on command routing from src/cli.mjs and domain modules in src/lib.
[OUTPUT]: Exposes ohmymkt CLI installation, command usage, and execution constraints.
[POS]: Root readme that bridges the handbook and executable commands.
[PROTOCOL]: Update this header when changed, then check AGENTS.md
-->

# ohmymkt

Operational CLI for the **SEO + AEO Growth System (2026)**.

## Quick Start

```bash
cd /Users/henry/PARA/[01] Projects/Vibe/ohmymkt/ohmymkt
node ./src/cli.mjs help
```

## Commands

```bash
# Create a growth plan
node ./src/cli.mjs plan-growth "Build non-brand organic growth"

# Evaluate Go/No-Go startup gates
node ./src/cli.mjs check-gates

# Start or resume campaign execution (blocked when gates fail)
node ./src/cli.mjs start-campaign [plan-name]

# Run cycle review and generate weekly/monthly/quarterly report
node ./src/cli.mjs run-cycle weekly
node ./src/cli.mjs run-cycle monthly
node ./src/cli.mjs run-cycle quarterly

# Register incident according to P0/P1/P2 protocol
node ./src/cli.mjs incident --severity P1 --module "AEO" --summary "Citation drop"

# Generate aggregate growth report
node ./src/cli.mjs report-growth --window 30d
```

## Runtime State

The CLI writes runtime files under:

- `.ohmymkt/plans/`
- `.ohmymkt/notepads/`
- `.ohmymkt/reports/`
- `.ohmymkt/incidents/`
- `.ohmymkt/state/`
- `.ohmymkt/boulder.json`

## Canonical Handbook

- `docs/seo-aeo-growth-system-2026.md`
