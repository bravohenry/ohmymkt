/**
 * [INPUT]: Plugin context, resolved config, all 18 tool factory functions
 * [OUTPUT]: Record of all ohmymkt_* tool definitions
 * [POS]: Tool registration assembly, wires domain logic into OpenCode tools
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import type { ToolDefinition } from "@opencode-ai/plugin";
import type { ResolvedConfig } from "./plugin-config";

import { createCheckGatesTool } from "./tools/check-gates";
import { createPlanGrowthTool } from "./tools/plan-growth";
import { createStartCampaignTool } from "./tools/start-campaign";
import { createRunCycleTool } from "./tools/run-cycle";
import { createIncidentTool } from "./tools/incident";
import { createReportGrowthTool } from "./tools/report-growth";
import { createListPlansTool } from "./tools/list-plans";
import { createUpdateGatesTool } from "./tools/update-gates";
import { createUpdateMetricsTool } from "./tools/update-metrics";
import { createReadStateTool } from "./tools/read-state";
import { createResearchBriefTool } from "./tools/research-brief";
import { createSavePositioningTool } from "./tools/save-positioning";
import { createAssetManifestTool } from "./tools/asset-manifest";
import { createProviderConfigTool } from "./tools/provider-config";
import { createGenerateImageTool } from "./tools/generate-image";
import { createGenerateVideoTool } from "./tools/generate-video";
import { createPublishContentTool } from "./tools/publish-content";
import { createCompetitorProfileTool } from "./tools/competitor-profile";

export function createTools(
  config: ResolvedConfig,
): Record<string, ToolDefinition> {
  return {
    ohmymkt_check_gates: createCheckGatesTool(config),
    ohmymkt_plan_growth: createPlanGrowthTool(config),
    ohmymkt_start_campaign: createStartCampaignTool(config),
    ohmymkt_run_cycle: createRunCycleTool(config),
    ohmymkt_incident: createIncidentTool(config),
    ohmymkt_report_growth: createReportGrowthTool(config),
    ohmymkt_list_plans: createListPlansTool(config),
    ohmymkt_update_gates: createUpdateGatesTool(config),
    ohmymkt_update_metrics: createUpdateMetricsTool(config),
    ohmymkt_read_state: createReadStateTool(config),
    ohmymkt_research_brief: createResearchBriefTool(config),
    ohmymkt_save_positioning: createSavePositioningTool(config),
    ohmymkt_asset_manifest: createAssetManifestTool(config),
    ohmymkt_provider_config: createProviderConfigTool(config),
    ohmymkt_generate_image: createGenerateImageTool(config),
    ohmymkt_generate_video: createGenerateVideoTool(config),
    ohmymkt_publish: createPublishContentTool(config),
    ohmymkt_competitor_profile: createCompetitorProfileTool(config),
  };
}
