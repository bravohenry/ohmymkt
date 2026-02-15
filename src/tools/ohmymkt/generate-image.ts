/**
 * [INPUT]: domain/content-gen (generateImage, ImageSpec), plugin-config, domain/research (upsertAsset)
 * [OUTPUT]: createGenerateImageTool factory returning ohmymkt_generate_image tool
 * [POS]: Image generation tool — delegates to configured provider, tracks asset
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import { tool } from "@opencode-ai/plugin/tool";
import type { ToolDefinition } from "@opencode-ai/plugin";
import type { ResolvedConfig } from "./config";
import { loadProvidersConfig } from "./config";
import { generateImage, type ImageSpec } from "./runtime/content-gen";
import { upsertAsset } from "./runtime/research";

export function createGenerateImageTool(config: ResolvedConfig): ToolDefinition {
  return tool({
    description:
      "Generate an image using the configured provider (nanobanana, openai, replicate). Returns the local file path and tracks the asset in the manifest.",
    args: {
      prompt: tool.schema.string().describe("Image generation prompt — be specific about subject, style, composition, and mood"),
      style: tool.schema.enum(["photo", "illustration", "graphic", "3d"]).optional().describe("Visual style"),
      aspect: tool.schema.enum(["1:1", "16:9", "9:16", "4:3"]).optional().describe("Aspect ratio"),
      size: tool.schema.string().optional().describe("Size override (e.g. 1024x1024)"),
      negative_prompt: tool.schema.string().optional().describe("What to avoid in the image"),
      name: tool.schema.string().optional().describe("Asset name for manifest tracking"),
    },
    execute: async (args) => {
      const providers = loadProvidersConfig(config.projectRoot);
      const provider = providers.image;

      if (!provider) {
        return `No image provider configured.\n\nRun \`ohmymkt_provider_config action=set category=image provider=nanobanana api_key_env=NANOBANANA_API_KEY\` to configure one.\n\nSupported: nanobanana, openai, replicate`;
      }

      const envKey = provider.api_key_env ?? "";
      if (envKey && !process.env[envKey]) {
        return `Image provider "${provider.provider}" configured but API key not set.\n\nSet the environment variable: export ${envKey}=your_key_here`;
      }

      const spec: ImageSpec = {
        prompt: args.prompt,
        ...(args.style && { style: args.style as ImageSpec["style"] }),
        ...(args.aspect && { aspect: args.aspect as ImageSpec["aspect"] }),
        ...(args.size && { size: args.size }),
        ...(args.negative_prompt && { negative_prompt: args.negative_prompt }),
      };

      try {
        const result = await generateImage(spec, provider, config.projectRoot);
        const assetName = args.name ?? `image-${Date.now()}`;
        upsertAsset(config.projectRoot, {
          type: "image",
          name: assetName,
          status: "done",
          format: "image",
          path: result.local_path,
          notes: `Provider: ${result.provider} | Prompt: ${result.prompt}`,
        });

        return `Image generated successfully.\n\nProvider: ${result.provider}\nLocal path: ${result.local_path}${result.url ? `\nURL: ${result.url}` : ""}\nAsset tracked as: ${assetName}`;
      } catch (err) {
        return `Image generation failed: ${err instanceof Error ? err.message : String(err)}`;
      }
    },
  });
}
