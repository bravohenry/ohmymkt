# agents/
> L2 | Parent: ../CLAUDE.md

Agent definitions for the ohmymkt OpenCode plugin. Each agent is a factory function returning `AgentConfig`.

## Members

- `types.ts`: Shared type contract — GrowthAgentName, AgentMode, AgentMeta
- `prompt-builder.ts`: Dynamic prompt generator for growth-manager, assembles domain knowledge (gates, workflow modes, tools) into structured LLM instructions
- `growth-manager.ts`: Primary orchestration agent — plans, gates, dual-track execution, cycle decisions, publishing orchestration. Uses thinking mode (32k budget)
- `seo-engineer.ts`: Subagent for technical SEO — site structure, Schema markup, Core Web Vitals, crawl budget
- `content-ops.ts`: Subagent for content operations — keyword clustering, content calendar, BOFU recovery, decay detection
- `content-writer.ts`: Subagent for content creation — text copy, image generation, video production for marketing assets (Sonnet model)
- `aeo-specialist.ts`: Subagent for Answer Engine Optimization — LLM visibility, structured data, citation signals
- `growth-analyst.ts`: Subagent for growth analysis — metrics tracking, trend analysis, experiment design, ROI calculation
- `research-agent.ts`: Subagent for market research — competitor analysis, audience insights, positioning research, intelligence gathering

## Architecture

```
growth-manager (primary, delegates to all subagents)
├── research-agent (subagent, Phase 1-2)
├── seo-engineer (subagent)
├── content-ops (subagent, strategy)
├── content-writer (subagent, creation)
├── aeo-specialist (subagent)
└── growth-analyst (subagent)
```

Wired into OpenCode via `../create-agents.ts`.

[PROTOCOL]: Update this file when agents are added, removed, or restructured, then check parent CLAUDE.md
