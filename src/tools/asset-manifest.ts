/**
 * [INPUT]: Domain research module (readAssetManifest, upsertAsset, formatAssetManifest)
 * [OUTPUT]: createAssetManifestTool factory returning ohmymkt_asset_manifest tool
 * [POS]: Asset tracking tool for Vibe Flow Phase 3
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import { tool } from "@opencode-ai/plugin/tool";
import type { ToolDefinition } from "@opencode-ai/plugin";
import type { ResolvedConfig } from "../plugin-config";
import {
  readAssetManifest,
  upsertAsset,
  formatAssetManifest,
} from "../domain/research";

export function createAssetManifestTool(config: ResolvedConfig): ToolDefinition {
  return tool({
    description:
      "Track marketing assets (landing pages, emails, ads, lead magnets, etc). Use action='add' to add/update an asset. Use action='read' to list all tracked assets.",
    args: {
      action: tool.schema.enum(["add", "read"]).describe("Action to perform"),
      type: tool.schema.string().optional().describe("Asset type: landing-page, email, ad, lead-magnet, social, blog, case-study, faq (for add)"),
      name: tool.schema.string().optional().describe("Asset name (for add)"),
      status: tool.schema.enum(["planned", "in_progress", "done", "blocked", "published"]).optional().describe("Asset status (for add)"),
      format: tool.schema.enum(["text", "image", "video", "html", "email"]).optional().describe("Asset format (for add)"),
      path: tool.schema.string().optional().describe("File path or URL of the asset (for add)"),
      notes: tool.schema.string().optional().describe("Additional notes (for add)"),
    },
    execute: async (args) => {
      const action = args.action;

      if (action === "read") {
        const manifest = readAssetManifest(config.projectRoot);
        return formatAssetManifest(manifest);
      }

      if (action === "add") {
        const type = args.type ?? "other";
        const name = args.name ?? "Untitled Asset";
        const status = (args.status as "planned" | "in_progress" | "done" | "blocked" | "published") ?? "planned";
        const format = (args.format as "text" | "image" | "video" | "html" | "email") ?? undefined;
        const assetPath = args.path ?? undefined;
        const notes = args.notes ?? undefined;
        const manifest = upsertAsset(config.projectRoot, { type, name, status, format, path: assetPath, notes });
        return `Asset tracked.\n\n${formatAssetManifest(manifest)}`;
      }

      return `Unknown action: ${action}. Use add or read.`;
    },
  });
}
