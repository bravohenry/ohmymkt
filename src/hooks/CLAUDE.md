# hooks/
> L2 | Parent: ../CLAUDE.md

## Members

gate-enforcer.ts: before-hook, blocks `ohmymkt_start_campaign` when gates fail
dual-track-balance.ts: after-hook, warns on single-track drift after `ohmymkt_run_cycle`
p0-auto-escalation.ts: after-hook, escalates P0 incidents with rollback protocol
cycle-reminder.ts: event-hook, logs warning when weekly cycle exceeds 7-day staleness

[PROTOCOL]: Update this when hooks are added/removed, then check parent CLAUDE.md
