/**
 * [INPUT]: plugin-config (ProvidersConfig, loadProvidersConfig), domain/io (writeJsonFile), domain/constants
 * [OUTPUT]: createProviderConfigTool factory returning ohmymkt_provider_config tool
 * [POS]: Provider configuration management — read/set/list image, video, publish providers
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import path from "node:path";
import { tool } from "@opencode-ai/plugin/tool";
import type { ToolDefinition } from "@opencode-ai/plugin";
import type { ResolvedConfig, ProvidersConfig, ProviderEntry } from "./config";
import { loadProvidersConfig } from "./config";
import { writeJsonFile } from "./runtime/io";
import { RUNTIME_DIR_NAME } from "./runtime/constants";

/* ------------------------------------------------------------------ */
/*  Supported providers registry                                       */
/* ------------------------------------------------------------------ */

const SUPPORTED: Record<string, { providers: string[]; example: Record<string, unknown> }> = {
  image: {
    providers: ["nanobanana", "openai", "replicate"],
    example: { provider: "nanobanana", api_key_env: "NANOBANANA_API_KEY", options: {} },
  },
  video: {
    providers: ["kling", "seedance"],
    example: { provider: "kling", api_key_env: "KLING_API_KEY", options: {} },
  },
  video_template: {
    providers: ["remotion"],
    example: { provider: "remotion", project_path: "./remotion", options: {} },
  },
  publish: {
    providers: ["twitter", "linkedin", "ghost", "resend", "buffer"],
    example: { provider: "twitter", api_key_env: "TWITTER_API_KEY", options: {} },
  },
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function providersFile(projectRoot: string): string {
  return path.join(projectRoot, RUNTIME_DIR_NAME, "providers.json");
}

function maskConfig(cfg: ProvidersConfig): ProvidersConfig {
  const masked = JSON.parse(JSON.stringify(cfg)) as ProvidersConfig;
  const maskEntry = (e: ProviderEntry) => {
    if (e.api_key_env) {
      const val = process.env[e.api_key_env];
      (e as unknown as Record<string, unknown>)["api_key_status"] = val ? "configured" : "missing";
    }
  };
  if (masked.image) maskEntry(masked.image);
  if (masked.video) maskEntry(masked.video);
  if (masked.video_template) maskEntry(masked.video_template);
  if (masked.publish) {
    for (const entry of Object.values(masked.publish)) maskEntry(entry);
  }
  return masked;
}

/* ------------------------------------------------------------------ */
/*  Tool factory                                                       */
/* ------------------------------------------------------------------ */

export function createProviderConfigTool(config: ResolvedConfig): ToolDefinition {
  return tool({
    description:
      "Manage content generation and publishing provider configuration. action='list' shows supported providers. action='read' shows current config. action='set' updates a provider entry.",
    args: {
      action: tool.schema.enum(["read", "set", "list"]).describe("Action to perform"),
      category: tool.schema.string().optional().describe("Provider category: image, video, video_template, or publish (for set)"),
      provider: tool.schema.string().optional().describe("Provider name (for set)"),
      api_key_env: tool.schema.string().optional().describe("Environment variable name for API key (for set)"),
      url: tool.schema.string().optional().describe("Service URL (for set, e.g. Ghost admin URL)"),
      project_path: tool.schema.string().optional().describe("Local project path (for set, e.g. Remotion project)"),
      platform: tool.schema.string().optional().describe("Platform name within publish category (for set, e.g. twitter)"),
      options: tool.schema.string().optional().describe("JSON object of extra options (for set)"),
    },
    execute: async (args) => {
      if (args.action === "list") {
        const lines = Object.entries(SUPPORTED).map(([cat, info]) => {
          const ex = JSON.stringify(info.example, null, 2);
          return `### ${cat}\nProviders: ${info.providers.join(", ")}\nExample:\n\`\`\`json\n${ex}\n\`\`\``;
        });
        return `# Supported Providers\n\n${lines.join("\n\n")}`;
      }

      if (args.action === "read") {
        const cfg = loadProvidersConfig(config.projectRoot);
        const masked = maskConfig(cfg);
        return `# Provider Configuration\n\n\`\`\`json\n${JSON.stringify(masked, null, 2)}\n\`\`\``;
      }

      if (args.action === "set") {
        const category = args.category;
        const provider = args.provider;
        if (!category || !provider) return "Error: category and provider are required for set action.";

        const entry: ProviderEntry = {
          provider,
          ...(args.api_key_env && { api_key_env: args.api_key_env }),
          ...(args.url && { url: args.url }),
          ...(args.project_path && { project_path: args.project_path }),
          ...(args.options && { options: JSON.parse(args.options) as Record<string, unknown> }),
        };

        const cfg = loadProvidersConfig(config.projectRoot);

        if (category === "publish") {
          const platform = args.platform ?? provider;
          cfg.publish = cfg.publish ?? {};
          cfg.publish[platform] = entry;
        } else {
          (cfg as Record<string, unknown>)[category] = entry;
        }

        writeJsonFile(providersFile(config.projectRoot), cfg);
        config.providers = cfg;
        return `Provider configured: ${category}${category === "publish" ? `/${args.platform ?? provider}` : ""} → ${provider}`;
      }

      return `Unknown action: ${args.action}. Use read, set, or list.`;
    },
  });
}
