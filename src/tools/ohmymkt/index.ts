import type { ToolDefinition } from "@opencode-ai/plugin"

import type { ResolvedConfig } from "./config"

import { createCheckGatesTool } from "./check-gates"
import { createPlanGrowthTool } from "./plan-growth"
import { createStartCampaignTool } from "./start-campaign"
import { createRunCycleTool } from "./run-cycle"
import { createIncidentTool } from "./incident"
import { createReportGrowthTool } from "./report-growth"
import { createListPlansTool } from "./list-plans"
import { createUpdateGatesTool } from "./update-gates"
import { createUpdateMetricsTool } from "./update-metrics"
import { createReadStateTool } from "./read-state"
import { createResearchBriefTool } from "./research-brief"
import { createSavePositioningTool } from "./save-positioning"
import { createAssetManifestTool } from "./asset-manifest"
import { createProviderConfigTool } from "./provider-config"
import { createGenerateImageTool } from "./generate-image"
import { createGenerateVideoTool } from "./generate-video"
import { createPublishContentTool } from "./publish-content"
import { createCompetitorProfileTool } from "./competitor-profile"
import { resolveOhmymktConfig } from "./config"

export function createOhmymktTools(args: { directory: string }): Record<string, ToolDefinition> {
  const config: ResolvedConfig = resolveOhmymktConfig(args.directory)

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
  }
}
