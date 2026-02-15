# Troubleshooting: Ollama Streaming in ohmymkt

If Ollama-based models appear to hang or truncate while running marketing workflows, use this checklist.

---

## Symptoms

- response stream stops mid-output
- long plan/review responses are cut
- execution appears stalled with no state updates

---

## Quick Checks

1. Confirm provider/model availability in your OpenCode environment.
2. Retry with a smaller prompt to isolate streaming length issues.
3. Run `bun run typecheck` and `bun run build` to rule out local runtime breakage.
4. Confirm tool path is healthy by running a simple `ohmymkt_read_state` call.

---

## Workarounds

- prefer shorter planning chunks
- split large tasks into staged cycles
- switch model/provider for long-form planning turns

---

## When to Escalate

Escalate if reproducible with:

- same prompt
- same provider/model
- clean workspace state
- no local type/build errors

Include runtime logs and a minimal reproduction prompt.
