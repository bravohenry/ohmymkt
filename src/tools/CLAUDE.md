# tools/
> L2 | Parent: ../CLAUDE.md

Tool layer — each file exports a factory `create*Tool(config: ResolvedConfig): ToolDefinition` that wraps a domain function into an OpenCode plugin tool.

## Members

check-gates.ts: Gate evaluation tool, calls `evaluateCurrentGates` + `formatGateReport`
plan-growth.ts: Plan creation tool, calls `createPlan`
start-campaign.ts: Campaign launcher, calls `startCampaign` with gate pre-check
run-cycle.ts: Cadence execution tool, calls `runCycle` for weekly/monthly/quarterly reviews
incident.ts: Incident registration, calls `registerIncident` with P0/P1/P2 severity
report-growth.ts: Growth summary report, calls `generateGrowthReport` over a time window
list-plans.ts: Plan listing tool, calls `listPlans` and formats output
update-gates.ts: Gate state mutation, reads/writes gates.json with parsed values
update-metrics.ts: Metrics state mutation, reads/writes metrics.json with track/trend data
read-state.ts: Raw state reader, returns JSON content of any runtime state file
research-brief.ts: Research brief CRUD, calls `saveResearchBrief` / `readResearchBrief` / `listResearchBriefs`
save-positioning.ts: Positioning angle storage, calls `savePositioning` / `readPositioning`
asset-manifest.ts: Asset manifest CRUD, calls `upsertAsset` / `readAssetManifest` / `formatAssetManifest`
provider-config.ts: Provider configuration management — read/set/list image, video, publish providers
generate-image.ts: Image generation via configured provider (nanobanana/openai/replicate), auto-tracks asset
generate-video.ts: Video generation via Remotion templates or AI (kling/seedance), auto-tracks asset
publish-content.ts: Content publishing to configured platforms (twitter/linkedin/ghost/resend/buffer), auto-updates manifest
competitor-profile.ts: Competitor profile CRUD, calls `saveCompetitorProfile` / `readCompetitorProfile` / `listCompetitorProfiles` / `formatCompetitorBattlecard`

## Conventions

- All tools return strings (not objects) — formatted for LLM readability
- Tool names use `ohmymkt_` prefix
- Each factory receives `ResolvedConfig` via closure from `create-tools.ts`
- Domain logic stays in `src/domain/`, tools are thin wrappers

[PROTOCOL]: Update this file when tools are added/removed, then check parent CLAUDE.md
