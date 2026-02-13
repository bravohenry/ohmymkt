/**
 * [INPUT]: domain/publish (publishContent, supportedPlatforms), plugin-config, domain/research (readAssetManifest, upsertAsset)
 * [OUTPUT]: createPublishContentTool factory returning ohmymkt_publish tool
 * [POS]: Content publishing tool — pushes content to configured platforms, updates asset manifest
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import { tool } from "@opencode-ai/plugin/tool";
import type { ToolDefinition } from "@opencode-ai/plugin";
import type { ResolvedConfig } from "../plugin-config";
import { loadProvidersConfig } from "../plugin-config";
import { publishContent, supportedPlatforms } from "../domain/publish";
import { readAssetManifest, upsertAsset } from "../domain/research";

export function createPublishContentTool(config: ResolvedConfig): ToolDefinition {
  return tool({
    description:
      "Publish content to a configured platform (twitter, linkedin, ghost, resend, buffer). Optionally link to an asset_id to update its manifest status.",
    args: {
      platform: tool.schema.string().describe("Target platform: twitter, linkedin, ghost, resend, buffer"),
      content: tool.schema.string().describe("Content to publish (text, HTML for ghost/resend)"),
      asset_id: tool.schema.string().optional().describe("Asset ID from manifest to mark as published"),
      media: tool.schema.string().optional().describe("JSON array of local media file paths to attach"),
      metadata: tool.schema.string().optional().describe("JSON object of platform-specific metadata (e.g. title, subject, to)"),
    },
    execute: async (args) => {
      const providers = loadProvidersConfig(config.projectRoot);
      const publishProviders = providers.publish ?? {};
      const provider = publishProviders[args.platform];

      if (!provider) {
        const configured = Object.keys(publishProviders);
        const supported = supportedPlatforms();
        return `Platform "${args.platform}" not configured.\n\n${
          configured.length > 0
            ? `Configured platforms: ${configured.join(", ")}`
            : "No publish platforms configured."
        }\n\nSupported: ${supported.join(", ")}\n\nRun \`ohmymkt_provider_config action=set category=publish platform=${args.platform} provider=${args.platform} api_key_env=${args.platform.toUpperCase()}_API_KEY\` to configure.`;
      }

      const envKey = provider.api_key_env ?? "";
      if (envKey && !process.env[envKey]) {
        return `Platform "${args.platform}" configured but API key not set.\n\nSet: export ${envKey}=your_key_here`;
      }

      const mediaPaths = args.media ? (JSON.parse(args.media) as string[]) : undefined;
      const metadata = args.metadata ? (JSON.parse(args.metadata) as Record<string, unknown>) : undefined;

      const result = await publishContent(
        {
          asset_id: args.asset_id,
          platform: args.platform,
          content: args.content,
          media_paths: mediaPaths,
          metadata,
        },
        provider,
      );

      // Update asset manifest if asset_id provided
      if (args.asset_id && result.status === "published") {
        const manifest = readAssetManifest(config.projectRoot);
        const asset = manifest.assets.find((a) => a.id === args.asset_id);
        if (asset) {
          const platforms = asset.published_platforms ?? [];
          if (!platforms.includes(args.platform)) platforms.push(args.platform);
          upsertAsset(config.projectRoot, {
            type: asset.type,
            name: asset.name,
            status: "published",
            format: asset.format,
            path: asset.path,
            notes: asset.notes,
            published_at: result.published_at,
            published_url: result.published_url,
            published_platforms: platforms,
          });
        }
      }

      if (result.status === "failed") {
        return `Publishing failed on ${result.platform}.\n\nError: ${result.error}`;
      }

      return `Content ${result.status} on ${result.platform}.\n\n${result.published_url ? `URL: ${result.published_url}\n` : ""}Published at: ${result.published_at}${args.asset_id ? `\nAsset "${args.asset_id}" manifest updated.` : ""}`;
    },
  });
}
