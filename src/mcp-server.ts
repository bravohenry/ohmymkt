/**
 * [INPUT]: MCP SDK, zod, all domain modules (gates, plans, campaign, cycle, incidents, reports, research, content-gen, publish, io, constants)
 * [OUTPUT]: stdio MCP server exposing 18 ohmymkt_* tools for oh-my-opencode
 * [POS]: MCP transport layer — replaces @opencode-ai/plugin tool registration for fork compatibility
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import path from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

/* ------------------------------------------------------------------ */
/*  Domain imports                                                     */
/* ------------------------------------------------------------------ */

import { templatePaths, runtimePaths, RUNTIME_DIR_NAME } from "./domain/constants.js";
import { readJsonFile, writeJsonFile, nowIso } from "./domain/io.js";
import { evaluateCurrentGates, formatGateReport, loadGateState } from "./domain/gates.js";
import { createPlan, listPlans } from "./domain/plans.js";
import { startCampaign } from "./domain/campaign.js";
import { runCycle } from "./domain/cycle.js";
import { registerIncident } from "./domain/incidents.js";
import { generateGrowthReport } from "./domain/reports.js";
import {
  saveResearchBrief,
  readResearchBrief,
  listResearchBriefs,
  formatResearchBrief,
  savePositioning,
  readPositioning,
  formatPositioning,
  readAssetManifest,
  upsertAsset,
  formatAssetManifest,
  saveCompetitorProfile,
  readCompetitorProfile,
  listCompetitorProfiles,
  formatCompetitorProfile,
  formatCompetitorBattlecard,
} from "./domain/research.js";
import type { ResearchFinding } from "./domain/research.js";
import { generateImage } from "./domain/content-gen.js";
import type { ImageSpec, VideoSpec } from "./domain/content-gen.js";
import { generateVideo } from "./domain/content-gen.js";
import { publishContent, supportedPlatforms } from "./domain/publish.js";
import { loadProvidersConfig } from "./plugin-config.js";

/* ------------------------------------------------------------------ */
/*  Config resolution                                                  */
/* ------------------------------------------------------------------ */

const PROJECT_ROOT = process.env.MKT_PROJECT_ROOT || process.cwd();
const PLUGIN_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const tpl = templatePaths(PLUGIN_ROOT);

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] });

function parseValue(raw: string): unknown {
  if (raw === "true") return true;
  if (raw === "false") return false;
  const num = Number(raw);
  if (!Number.isNaN(num) && raw.trim() !== "") return num;
  return raw;
}

/* ------------------------------------------------------------------ */
/*  Server                                                             */
/* ------------------------------------------------------------------ */

const server = new McpServer({ name: "ohmymkt", version: "0.2.0" });

/* ------------------------------------------------------------------ */
/*  1. ohmymkt_check_gates                                             */
/* ------------------------------------------------------------------ */

server.tool(
  "ohmymkt_check_gates",
  "Evaluate all five startup gates (Strategy, Compliance, Capacity, Data, Ownership) and report pass/fail status. Run this before starting a campaign to verify readiness.",
  async () => {
    const result = evaluateCurrentGates(PROJECT_ROOT, tpl);
    const report = formatGateReport(result.evaluations);
    const overall = result.allPassed ? "ALL GATES PASSED" : "BLOCKED — one or more gates failed";
    return text(`${report}\n\nOverall: ${overall}`);
  },
);

/* ------------------------------------------------------------------ */
/*  2. ohmymkt_plan_growth                                             */
/* ------------------------------------------------------------------ */

server.tool(
  "ohmymkt_plan_growth",
  "Create a new growth plan with a stated goal. The plan includes startup gates, role assignments, dual-track execution checklist, and cycle cadence. Optionally provide a custom name.",
  { goal: z.string().describe("The business goal this growth plan targets"), name: z.string().optional().describe("Optional custom plan name (slug-safe)") },
  async (args) => {
    const result = createPlan(PROJECT_ROOT, args.goal, args.name);
    return text(`Plan created: ${result.name}\nFile: ${result.filePath}`);
  },
);

/* ------------------------------------------------------------------ */
/*  3. ohmymkt_start_campaign                                          */
/* ------------------------------------------------------------------ */

server.tool(
  "ohmymkt_start_campaign",
  "Start a growth campaign. Verifies all startup gates pass, resolves a plan, initializes sprint board, notepads, and execution state. Optionally specify which plan to use.",
  { plan: z.string().optional().describe("Plan name or hint to resolve (defaults to latest plan)") },
  async (args) => {
    const result = startCampaign(PROJECT_ROOT, args.plan, tpl);
    if (!result.ok) {
      const gateReport = formatGateReport(result.gateResult.evaluations);
      return text(`Campaign blocked: ${result.reason}\n\n${gateReport}`);
    }
    return text([
      `Campaign started for plan: ${result.plan.title}`,
      `Sprint board: ${result.sprintSize} tasks loaded`,
      `Notepads: ${result.notepads.planNotepadDir}`,
      `Boulder role: ${result.boulder.role}`,
    ].join("\n"));
  },
);

/* ------------------------------------------------------------------ */
/*  4. ohmymkt_run_cycle                                               */
/* ------------------------------------------------------------------ */

server.tool(
  "ohmymkt_run_cycle",
  "Run an operational review cycle at the specified cadence. Evaluates gates, metrics, and incidents to produce a continue/intervene/rollback decision with recommended actions.",
  { cadence: z.enum(["weekly", "monthly", "quarterly"]).describe("Cycle cadence to execute") },
  async (args) => {
    const result = runCycle(PROJECT_ROOT, args.cadence, tpl);
    return text([
      `Decision: ${result.decision}`,
      `Reason: ${result.reason}`,
      "",
      "Actions:",
      ...result.actions.map((a: string) => `- ${a}`),
      "",
      `Report: ${result.reportFile}`,
    ].join("\n"));
  },
);

/* ------------------------------------------------------------------ */
/*  5. ohmymkt_incident                                                */
/* ------------------------------------------------------------------ */

server.tool(
  "ohmymkt_incident",
  "Register a growth incident with severity (P0/P1/P2), affected module, and summary. P0 triggers immediate rollback in the next cycle decision.",
  {
    severity: z.enum(["P0", "P1", "P2"]).describe("Incident severity level"),
    module: z.string().describe("Affected module or track name"),
    summary: z.string().describe("Brief description of the incident"),
  },
  async (args) => {
    const { record, filePath } = registerIncident(PROJECT_ROOT, { severity: args.severity, module: args.module, summary: args.summary });
    return text(`Incident registered: ${record.id}\nSeverity: ${record.severity}\nModule: ${record.module}\nFile: ${filePath}`);
  },
);

/* ------------------------------------------------------------------ */
/*  6. ohmymkt_report_growth                                           */
/* ------------------------------------------------------------------ */

server.tool(
  "ohmymkt_report_growth",
  "Generate a growth summary report over a time window. Aggregates cycle decisions, incident counts, and gate status into a single report file.",
  { window: z.string().optional().describe("Time window like '7d', '30d', '90d' (default '7d')") },
  async (args) => {
    const result = generateGrowthReport(PROJECT_ROOT, args.window || "7d", tpl);
    const ic = result.incidentCount;
    const dc = result.decisionCount;
    return text([
      `Growth report generated (${result.days}d window)`,
      `Gates: ${result.gatesPassed ? "PASS" : "FAIL"}`,
      `Decisions — continue: ${dc.continue}, intervene: ${dc.intervene}, rollback: ${dc.rollback}`,
      `Incidents — P0: ${ic.p0}, P1: ${ic.p1}, P2: ${ic.p2}`,
      `File: ${result.filePath}`,
    ].join("\n"));
  },
);

/* ------------------------------------------------------------------ */
/*  7. ohmymkt_list_plans                                              */
/* ------------------------------------------------------------------ */

server.tool(
  "ohmymkt_list_plans",
  "List all growth plans in the project. Returns plan file names and titles.",
  async () => {
    const plans = listPlans(PROJECT_ROOT);
    if (plans.length === 0) return text("No plans found. Use ohmymkt_plan_growth to create one.");
    const lines = plans.map((p: any, i: number) => `${i + 1}. ${p.title} (${p.fileName})`);
    return text(`Plans (${plans.length}):\n${lines.join("\n")}`);
  },
);

/* ------------------------------------------------------------------ */
/*  8. ohmymkt_update_gates                                            */
/* ------------------------------------------------------------------ */

server.tool(
  "ohmymkt_update_gates",
  "Update a specific field on a startup gate. Gate keys: strategy_gate, compliance_gate, capacity_gate, data_gate, ownership_gate. Values are auto-parsed (boolean, number, or string).",
  {
    gate: z.string().describe("Gate key, e.g. 'strategy_gate'"),
    field: z.string().describe("Field name within the gate, e.g. 'approved'"),
    value: z.string().describe("New value (auto-parsed to boolean/number/string)"),
  },
  async (args) => {
    const state = loadGateState(PROJECT_ROOT, tpl);
    const gateObj = (state[args.gate] ?? {}) as Record<string, unknown>;
    gateObj[args.field] = parseValue(args.value);
    state[args.gate] = gateObj;
    state.updated_at = nowIso();
    const runtime = runtimePaths(PROJECT_ROOT);
    writeJsonFile(runtime.gatesFile, state);
    return text(`Updated ${args.gate}.${args.field} = ${args.value}`);
  },
);

/* ------------------------------------------------------------------ */
/*  9. ohmymkt_update_metrics                                          */
/* ------------------------------------------------------------------ */

server.tool(
  "ohmymkt_update_metrics",
  "Update a metric within a track. Tracks: visibility_track, quality_track. Set the metric name, its value, and trend direction (up/down/flat).",
  {
    track: z.string().describe("Track key, e.g. 'visibility_track'"),
    metric: z.string().describe("Metric name, e.g. 'non_brand_visibility'"),
    value: z.string().describe("Metric value"),
    trend: z.string().describe("Trend direction: up, down, or flat"),
  },
  async (args) => {
    const runtime = runtimePaths(PROJECT_ROOT);
    const metrics = readJsonFile<Record<string, unknown>>(runtime.metricsFile, {});
    const trackObj = (metrics[args.track] ?? {}) as Record<string, unknown>;
    trackObj[args.metric] = args.value;
    trackObj[`${args.metric}_trend`] = args.trend;
    metrics[args.track] = trackObj;
    metrics.updated_at = nowIso();
    writeJsonFile(runtime.metricsFile, metrics);
    return text(`Updated ${args.track}.${args.metric} = ${args.value} (trend: ${args.trend})`);
  },
);

/* ------------------------------------------------------------------ */
/*  10. ohmymkt_read_state                                             */
/* ------------------------------------------------------------------ */

server.tool(
  "ohmymkt_read_state",
  "Read a runtime state file. Available files: gates, metrics, modules, sprint-board, boulder, execution. Returns the raw JSON content.",
  { file: z.enum(["gates", "metrics", "modules", "sprint-board", "boulder", "execution"]).describe("State file to read") },
  async (args) => {
    const runtime = runtimePaths(PROJECT_ROOT);
    const FILE_MAP: Record<string, string> = {
      gates: runtime.gatesFile,
      metrics: runtime.metricsFile,
      modules: runtime.modulesFile,
      "sprint-board": runtime.sprintBoardFile,
      boulder: runtime.boulderFile,
      execution: runtime.executionFile,
    };
    const filePath = FILE_MAP[args.file];
    const data = readJsonFile<unknown>(filePath, null);
    if (data === null) return text(`State file '${args.file}' does not exist yet.`);
    return text(JSON.stringify(data, null, 2));
  },
);

/* ------------------------------------------------------------------ */
/*  11. ohmymkt_research_brief                                         */
/* ------------------------------------------------------------------ */

server.tool(
  "ohmymkt_research_brief",
  "Create, read, or list research briefs. Use action='create' with title/objectives/competitors/findings/gaps to save a brief. Use action='read' with id to retrieve one. Use action='list' to see all brief IDs.",
  {
    action: z.enum(["create", "read", "list"]).describe("Action to perform"),
    id: z.string().optional().describe("Brief ID (for read)"),
    title: z.string().optional().describe("Brief title (for create)"),
    objectives: z.string().optional().describe("JSON array of objective strings (for create)"),
    competitors: z.string().optional().describe("JSON array of competitor strings (for create)"),
    findings: z.string().optional().describe("JSON array of {source,finding,relevance,action,category?,confidence?} objects (for create)"),
    gaps: z.string().optional().describe("JSON array of gap strings (for create)"),
  },
  async (args) => {
    if (args.action === "list") {
      const ids = listResearchBriefs(PROJECT_ROOT);
      return text(ids.length > 0 ? `Research briefs:\n${ids.map((id: string) => `- ${id}`).join("\n")}` : "No research briefs found.");
    }
    if (args.action === "read") {
      const id = args.id ?? "";
      if (!id) return text("Error: id is required for read action.");
      const brief = readResearchBrief(PROJECT_ROOT, id);
      if (!brief) return text(`No brief found with id: ${id}`);
      return text(formatResearchBrief(brief));
    }
    if (args.action === "create") {
      const title = args.title ?? "Untitled Research";
      const objectives = JSON.parse(args.objectives ?? "[]") as string[];
      const competitors = JSON.parse(args.competitors ?? "[]") as string[];
      const findings = JSON.parse(args.findings ?? "[]") as ResearchFinding[];
      const gaps = JSON.parse(args.gaps ?? "[]") as string[];
      const brief = saveResearchBrief(PROJECT_ROOT, { title, objectives, competitors, findings, gaps });
      return text(`Research brief saved.\n\n${formatResearchBrief(brief)}`);
    }
    return text(`Unknown action: ${args.action}`);
  },
);

/* ------------------------------------------------------------------ */
/*  12. ohmymkt_save_positioning                                       */
/* ------------------------------------------------------------------ */

server.tool(
  "ohmymkt_save_positioning",
  "Save or read positioning angles. Use action='save' to store a positioning angle with statement, headline, proof points, risks, and score. Use action='read' to view all saved angles.",
  {
    action: z.enum(["save", "read"]).describe("Action to perform"),
    name: z.string().optional().describe("Angle name (for save)"),
    statement: z.string().optional().describe("Positioning statement (for save)"),
    headline: z.string().optional().describe("Headline (for save)"),
    proof_points: z.string().optional().describe("JSON array of proof point strings (for save)"),
    risks: z.string().optional().describe("JSON array of risk strings (for save)"),
    score: z.string().optional().describe("JSON object of score dimensions (for save)"),
    selected: z.string().optional().describe("'true' to mark as selected angle (for save)"),
    rationale: z.string().optional().describe("Selection rationale (for save)"),
  },
  async (args) => {
    if (args.action === "read") {
      const angles = readPositioning(PROJECT_ROOT);
      return text(formatPositioning(angles));
    }
    if (args.action === "save") {
      const name = args.name ?? "Untitled Angle";
      const statement = args.statement ?? "";
      const headline = args.headline ?? "";
      const proof_points = JSON.parse(args.proof_points ?? "[]") as string[];
      const risks = JSON.parse(args.risks ?? "[]") as string[];
      const score = JSON.parse(args.score ?? "{}") as Record<string, number>;
      const selected = args.selected === "true";
      const rationale = args.rationale ?? "";
      savePositioning(PROJECT_ROOT, { name, statement, headline, proof_points, risks, score, selected, rationale });
      return text(`Positioning angle saved: ${name}${selected ? " (SELECTED)" : ""}\n\n${formatPositioning(readPositioning(PROJECT_ROOT))}`);
    }
    return text(`Unknown action: ${args.action}`);
  },
);

/* ------------------------------------------------------------------ */
/*  13. ohmymkt_asset_manifest                                         */
/* ------------------------------------------------------------------ */

server.tool(
  "ohmymkt_asset_manifest",
  "Track content assets in the manifest. Use action='add' to register a new asset with type, name, status, format. Use action='read' to view the full manifest.",
  {
    action: z.enum(["add", "read"]).describe("Action to perform"),
    type: z.string().optional().describe("Asset type (for add)"),
    name: z.string().optional().describe("Asset name (for add)"),
    status: z.string().optional().describe("Asset status: planned, in_progress, done, blocked, published (for add)"),
    format: z.string().optional().describe("Asset format: text, image, video, html, email (for add)"),
    path: z.string().optional().describe("File path (for add)"),
    notes: z.string().optional().describe("Notes (for add)"),
  },
  async (args) => {
    if (args.action === "read") {
      const manifest = readAssetManifest(PROJECT_ROOT);
      return text(formatAssetManifest(manifest));
    }
    if (args.action === "add") {
      const manifest = upsertAsset(PROJECT_ROOT, {
        type: args.type ?? "other",
        name: args.name ?? "Untitled Asset",
        status: (args.status as any) ?? "planned",
        format: args.format as any,
        path: args.path,
        notes: args.notes,
      });
      return text(`Asset tracked.\n\n${formatAssetManifest(manifest)}`);
    }
    return text(`Unknown action: ${args.action}`);
  },
);

/* ------------------------------------------------------------------ */
/*  14. ohmymkt_provider_config                                        */
/* ------------------------------------------------------------------ */

const SUPPORTED: Record<string, { providers: string[]; example: Record<string, unknown> }> = {
  image: { providers: ["nanobanana", "openai", "replicate"], example: { provider: "nanobanana", api_key_env: "NANOBANANA_API_KEY" } },
  video: { providers: ["kling", "seedance"], example: { provider: "kling", api_key_env: "KLING_API_KEY" } },
  video_template: { providers: ["remotion"], example: { provider: "remotion", project_path: "./remotion" } },
  publish: { providers: ["twitter", "linkedin", "ghost", "resend", "buffer"], example: { provider: "twitter", api_key_env: "TWITTER_API_KEY" } },
};

function maskConfig(cfg: any): any {
  const masked = JSON.parse(JSON.stringify(cfg));
  const maskEntry = (e: any) => { if (e.api_key_env) e.api_key_status = process.env[e.api_key_env] ? "configured" : "missing"; };
  if (masked.image) maskEntry(masked.image);
  if (masked.video) maskEntry(masked.video);
  if (masked.video_template) maskEntry(masked.video_template);
  if (masked.publish) for (const entry of Object.values(masked.publish)) maskEntry(entry as any);
  return masked;
}

server.tool(
  "ohmymkt_provider_config",
  "Manage provider configuration for image generation, video generation, and content publishing. Use action='list' to see supported providers, action='read' to view current config, action='set' to configure a provider.",
  {
    action: z.enum(["read", "set", "list"]).describe("Action to perform"),
    category: z.string().optional().describe("Provider category: image, video, video_template, publish (for set)"),
    provider: z.string().optional().describe("Provider name (for set)"),
    api_key_env: z.string().optional().describe("Environment variable name for API key (for set)"),
    url: z.string().optional().describe("Provider URL (for set)"),
    project_path: z.string().optional().describe("Project path for template providers (for set)"),
    platform: z.string().optional().describe("Platform name for publish category (for set)"),
    options: z.string().optional().describe("JSON object of additional options (for set)"),
  },
  async (args) => {
    if (args.action === "list") {
      const lines = Object.entries(SUPPORTED).map(([cat, info]) =>
        `### ${cat}\nProviders: ${info.providers.join(", ")}\nExample:\n\`\`\`json\n${JSON.stringify(info.example, null, 2)}\n\`\`\``);
      return text(`# Supported Providers\n\n${lines.join("\n\n")}`);
    }
    if (args.action === "read") {
      const cfg = loadProvidersConfig(PROJECT_ROOT);
      return text(`# Provider Configuration\n\n\`\`\`json\n${JSON.stringify(maskConfig(cfg), null, 2)}\n\`\`\``);
    }
    if (args.action === "set") {
      if (!args.category || !args.provider) return text("Error: category and provider are required for set action.");
      const entry: any = { provider: args.provider };
      if (args.api_key_env) entry.api_key_env = args.api_key_env;
      if (args.url) entry.url = args.url;
      if (args.project_path) entry.project_path = args.project_path;
      if (args.options) entry.options = JSON.parse(args.options);
      const cfg = loadProvidersConfig(PROJECT_ROOT);
      if (args.category === "publish") {
        cfg.publish = cfg.publish ?? {};
        cfg.publish[args.platform ?? args.provider] = entry;
      } else {
        (cfg as any)[args.category] = entry;
      }
      writeJsonFile(path.join(PROJECT_ROOT, RUNTIME_DIR_NAME, "providers.json"), cfg);
      return text(`Provider configured: ${args.category}${args.category === "publish" ? `/${args.platform ?? args.provider}` : ""} → ${args.provider}`);
    }
    return text(`Unknown action: ${args.action}`);
  },
);

/* ------------------------------------------------------------------ */
/*  15. ohmymkt_generate_image                                         */
/* ------------------------------------------------------------------ */

server.tool(
  "ohmymkt_generate_image",
  "Generate an image using the configured image provider (nanobanana, openai, replicate). Provide a prompt and optional style/aspect/size parameters. The result is tracked in the asset manifest.",
  {
    prompt: z.string().describe("Image generation prompt"),
    style: z.string().optional().describe("Image style: photo, illustration, graphic, 3d"),
    aspect: z.string().optional().describe("Aspect ratio: 1:1, 16:9, 9:16, 4:3"),
    size: z.string().optional().describe("Size hint"),
    negative_prompt: z.string().optional().describe("Negative prompt"),
    name: z.string().optional().describe("Asset name for manifest tracking"),
  },
  async (args) => {
    const providers = loadProvidersConfig(PROJECT_ROOT);
    const provider = providers.image;
    if (!provider) return text("No image provider configured.\n\nRun `ohmymkt_provider_config action=set category=image provider=nanobanana api_key_env=NANOBANANA_API_KEY` to configure one.\n\nSupported: nanobanana, openai, replicate");
    const envKey = provider.api_key_env ?? "";
    if (envKey && !process.env[envKey]) return text(`Image provider "${provider.provider}" configured but API key not set.\n\nSet: export ${envKey}=your_key_here`);
    const spec: ImageSpec = {
      prompt: args.prompt,
      ...(args.style && { style: args.style as ImageSpec["style"] }),
      ...(args.aspect && { aspect: args.aspect as ImageSpec["aspect"] }),
      ...(args.size && { size: args.size }),
      ...(args.negative_prompt && { negative_prompt: args.negative_prompt }),
    };
    try {
      const result = await generateImage(spec, provider, PROJECT_ROOT);
      const assetName = args.name ?? `image-${Date.now()}`;
      upsertAsset(PROJECT_ROOT, { type: "image", name: assetName, status: "done", format: "image", path: result.local_path, notes: `Provider: ${result.provider} | Prompt: ${result.prompt}` });
      return text(`Image generated.\n\nProvider: ${result.provider}\nPath: ${result.local_path}${result.url ? `\nURL: ${result.url}` : ""}\nAsset: ${assetName}`);
    } catch (err) {
      return text(`Image generation failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
);

/* ------------------------------------------------------------------ */
/*  16. ohmymkt_generate_video                                         */
/* ------------------------------------------------------------------ */

server.tool(
  "ohmymkt_generate_video",
  "Generate a video using either a template engine (Remotion) or AI generation (Kling, Seedance). Use type='template' for Remotion, type='ai' for AI-generated video.",
  {
    type: z.string().describe("template=Remotion, ai=AI generation"),
    prompt: z.string().optional().describe("Video prompt (for ai type)"),
    template_id: z.string().optional().describe("Template ID (for template type)"),
    props: z.string().optional().describe("JSON object of template props (for template type)"),
    image_url: z.string().optional().describe("Source image URL (for ai type)"),
    duration: z.string().optional().describe("Duration hint"),
    aspect: z.string().optional().describe("Aspect ratio"),
    name: z.string().optional().describe("Asset name for manifest tracking"),
  },
  async (args) => {
    const providers = loadProvidersConfig(PROJECT_ROOT);
    const isTemplate = args.type === "template";
    const provider = isTemplate ? providers.video_template : providers.video;
    const categoryLabel = isTemplate ? "video_template" : "video";
    if (!provider) {
      const hint = isTemplate
        ? "ohmymkt_provider_config action=set category=video_template provider=remotion project_path=./remotion"
        : "ohmymkt_provider_config action=set category=video provider=kling api_key_env=KLING_API_KEY";
      return text(`No ${categoryLabel} provider configured.\n\nRun \`${hint}\` to configure one.\n\nSupported: ${isTemplate ? "remotion" : "kling, seedance"}`);
    }
    if (!isTemplate) {
      const envKey = provider.api_key_env ?? "";
      if (envKey && !process.env[envKey]) return text(`Video provider "${provider.provider}" configured but API key not set.\n\nSet: export ${envKey}=your_key_here`);
    }
    const spec: VideoSpec = {
      type: args.type as "template" | "ai",
      ...(args.prompt && { prompt: args.prompt }),
      ...(args.template_id && { template_id: args.template_id }),
      ...(args.props && { props: JSON.parse(args.props) as Record<string, unknown> }),
      ...(args.image_url && { image_url: args.image_url }),
      ...(args.duration && { duration: args.duration }),
      ...(args.aspect && { aspect: args.aspect }),
    };
    try {
      const result = await generateVideo(spec, provider, PROJECT_ROOT);
      const assetName = args.name ?? `video-${Date.now()}`;
      upsertAsset(PROJECT_ROOT, { type: "video", name: assetName, status: "done", format: "video", path: result.local_path, notes: `Provider: ${result.provider} | Type: ${result.type}` });
      return text(`Video generated.\n\nProvider: ${result.provider}\nType: ${result.type}\nPath: ${result.local_path}${result.url ? `\nURL: ${result.url}` : ""}\nAsset: ${assetName}`);
    } catch (err) {
      return text(`Video generation failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
);

/* ------------------------------------------------------------------ */
/*  17. ohmymkt_publish                                                */
/* ------------------------------------------------------------------ */

server.tool(
  "ohmymkt_publish",
  "Publish content to a configured platform (twitter, linkedin, ghost, resend, buffer). Optionally link to an asset_id to update its manifest status.",
  {
    platform: z.string().describe("Target platform: twitter, linkedin, ghost, resend, buffer"),
    content: z.string().describe("Content to publish (text, HTML for ghost/resend)"),
    asset_id: z.string().optional().describe("Asset ID from manifest to mark as published"),
    media: z.string().optional().describe("JSON array of local media file paths to attach"),
    metadata: z.string().optional().describe("JSON object of platform-specific metadata"),
  },
  async (args) => {
    const providers = loadProvidersConfig(PROJECT_ROOT);
    const publishProviders = providers.publish ?? {};
    const provider = publishProviders[args.platform];
    if (!provider) {
      const configured = Object.keys(publishProviders);
      const supported = supportedPlatforms();
      return text(`Platform "${args.platform}" not configured.\n\n${configured.length > 0 ? `Configured: ${configured.join(", ")}` : "No publish platforms configured."}\n\nSupported: ${supported.join(", ")}`);
    }
    const envKey = provider.api_key_env ?? "";
    if (envKey && !process.env[envKey]) return text(`Platform "${args.platform}" configured but API key not set.\n\nSet: export ${envKey}=your_key_here`);
    const mediaPaths = args.media ? JSON.parse(args.media) as string[] : undefined;
    const metadata = args.metadata ? JSON.parse(args.metadata) as Record<string, unknown> : undefined;
    const result = await publishContent({ asset_id: args.asset_id, platform: args.platform, content: args.content, media_paths: mediaPaths, metadata }, provider);
    if (args.asset_id && result.status === "published") {
      const manifest = readAssetManifest(PROJECT_ROOT);
      const asset = manifest.assets.find((a: any) => a.id === args.asset_id);
      if (asset) {
        const platforms = asset.published_platforms ?? [];
        if (!platforms.includes(args.platform)) platforms.push(args.platform);
        upsertAsset(PROJECT_ROOT, { type: asset.type, name: asset.name, status: "published", format: asset.format, path: asset.path, notes: asset.notes, published_at: result.published_at, published_url: result.published_url, published_platforms: platforms });
      }
    }
    if (result.status === "failed") return text(`Publishing failed on ${result.platform}.\n\nError: ${result.error}`);
    return text(`Content ${result.status} on ${result.platform}.\n\n${result.published_url ? `URL: ${result.published_url}\n` : ""}Published at: ${result.published_at}${args.asset_id ? `\nAsset "${args.asset_id}" manifest updated.` : ""}`);
  },
);

/* ------------------------------------------------------------------ */
/*  18. ohmymkt_competitor_profile                                     */
/* ------------------------------------------------------------------ */

server.tool(
  "ohmymkt_competitor_profile",
  "Save, read, list, or generate battlecards for competitor profiles. Use action='save' to store a profile, action='read' to view one, action='list' to see all, action='battlecard' to generate a competitive battlecard.",
  {
    action: z.enum(["save", "read", "list", "battlecard"]).describe("Action to perform"),
    id: z.string().optional().describe("Competitor profile ID (for read/battlecard)"),
    name: z.string().optional().describe("Competitor name (for save)"),
    url: z.string().optional().describe("Competitor URL (for save)"),
    positioning: z.string().optional().describe("Competitor positioning statement (for save)"),
    pricing: z.string().optional().describe("Pricing info (for save)"),
    strengths: z.string().optional().describe("JSON array of strengths (for save)"),
    weaknesses: z.string().optional().describe("JSON array of weaknesses (for save)"),
    features: z.string().optional().describe("JSON array of features (for save)"),
    target_audience: z.string().optional().describe("Target audience (for save)"),
    differentiators: z.string().optional().describe("JSON array of differentiators (for save)"),
    threats: z.string().optional().describe("JSON array of threats (for save)"),
    opportunities: z.string().optional().describe("JSON array of opportunities (for save)"),
  },
  async (args) => {
    if (args.action === "list") {
      const ids = listCompetitorProfiles(PROJECT_ROOT);
      return text(ids.length > 0 ? `Competitor profiles:\n${ids.map((id: string) => `- ${id}`).join("\n")}` : "No competitor profiles found.");
    }
    if (args.action === "read") {
      if (!args.id) return text("Error: id is required for read action.");
      const profile = readCompetitorProfile(PROJECT_ROOT, args.id);
      if (!profile) return text(`No competitor profile found with id: ${args.id}`);
      return text(formatCompetitorProfile(profile));
    }
    if (args.action === "battlecard") {
      if (!args.id) return text("Error: id is required for battlecard action.");
      const profile = readCompetitorProfile(PROJECT_ROOT, args.id);
      if (!profile) return text(`No competitor profile found with id: ${args.id}`);
      return text(formatCompetitorBattlecard(profile));
    }
    if (args.action === "save") {
      if (!args.name) return text("Error: name is required for save action.");
      if (!args.positioning) return text("Error: positioning is required for save action.");
      const profile = saveCompetitorProfile(PROJECT_ROOT, {
        name: args.name,
        url: args.url,
        positioning: args.positioning,
        pricing: args.pricing,
        strengths: JSON.parse(args.strengths ?? "[]"),
        weaknesses: JSON.parse(args.weaknesses ?? "[]"),
        features: args.features ? JSON.parse(args.features) : undefined,
        target_audience: args.target_audience,
        differentiators: args.differentiators ? JSON.parse(args.differentiators) : undefined,
        threats: args.threats ? JSON.parse(args.threats) : undefined,
        opportunities: args.opportunities ? JSON.parse(args.opportunities) : undefined,
      });
      return text(`Competitor profile saved.\n\n${formatCompetitorProfile(profile)}`);
    }
    return text(`Unknown action: ${args.action}`);
  },
);

/* ------------------------------------------------------------------ */
/*  Start server                                                       */
/* ------------------------------------------------------------------ */

const transport = new StdioServerTransport();
await server.connect(transport);
