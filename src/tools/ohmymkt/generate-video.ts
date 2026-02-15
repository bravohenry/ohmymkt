/**
 * [INPUT]: domain/content-gen (generateVideo, VideoSpec), plugin-config, domain/research (upsertAsset)
 * [OUTPUT]: createGenerateVideoTool factory returning ohmymkt_generate_video tool
 * [POS]: Video generation tool — Remotion templates or AI video (kling/seedance), tracks asset
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import { tool } from "@opencode-ai/plugin/tool";
import type { ToolDefinition } from "@opencode-ai/plugin";
import type { ResolvedConfig } from "./config";
import { loadProvidersConfig } from "./config";
import { generateVideo, type VideoSpec } from "./runtime/content-gen";
import { upsertAsset } from "./runtime/research";

export function createGenerateVideoTool(config: ResolvedConfig): ToolDefinition {
  return tool({
    description:
      "Generate a video using Remotion templates (type=template) or AI video generation (type=ai, via kling/seedance). Returns the local file path and tracks the asset.",
    args: {
      type: tool.schema.enum(["template", "ai"]).describe("template = Remotion render, ai = AI video generation"),
      prompt: tool.schema.string().optional().describe("Video generation prompt (for ai type)"),
      template_id: tool.schema.string().optional().describe("Remotion composition ID (for template type)"),
      props: tool.schema.string().optional().describe("JSON object of Remotion props (for template type)"),
      image_url: tool.schema.string().optional().describe("Source image URL for image-to-video (for ai type)"),
      duration: tool.schema.string().optional().describe("Video duration, e.g. '5s' or '10s'"),
      aspect: tool.schema.string().optional().describe("Aspect ratio, e.g. '16:9' or '9:16'"),
      name: tool.schema.string().optional().describe("Asset name for manifest tracking"),
    },
    execute: async (args) => {
      const providers = loadProvidersConfig(config.projectRoot);
      const isTemplate = args.type === "template";
      const provider = isTemplate ? providers.video_template : providers.video;
      const categoryLabel = isTemplate ? "video_template" : "video";

      if (!provider) {
        const hint = isTemplate
          ? `ohmymkt_provider_config action=set category=video_template provider=remotion project_path=./remotion`
          : `ohmymkt_provider_config action=set category=video provider=kling api_key_env=KLING_API_KEY`;
        return `No ${categoryLabel} provider configured.\n\nRun \`${hint}\` to configure one.\n\nSupported: ${isTemplate ? "remotion" : "kling, seedance"}`;
      }

      if (!isTemplate) {
        const envKey = provider.api_key_env ?? "";
        if (envKey && !process.env[envKey]) {
          return `Video provider "${provider.provider}" configured but API key not set.\n\nSet the environment variable: export ${envKey}=your_key_here`;
        }
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
        const result = await generateVideo(spec, provider, config.projectRoot);
        const assetName = args.name ?? `video-${Date.now()}`;
        upsertAsset(config.projectRoot, {
          type: "video",
          name: assetName,
          status: "done",
          format: "video",
          path: result.local_path,
          notes: `Provider: ${result.provider} | Type: ${result.type}`,
        });

        return `Video generated successfully.\n\nProvider: ${result.provider}\nType: ${result.type}\nLocal path: ${result.local_path}${result.url ? `\nURL: ${result.url}` : ""}\nAsset tracked as: ${assetName}`;
      } catch (err) {
        return `Video generation failed: ${err instanceof Error ? err.message : String(err)}`;
      }
    },
  });
}
