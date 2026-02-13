/**
 * [INPUT]: Plugin context from @opencode-ai/plugin, .ohmymkt/providers.json
 * [OUTPUT]: Zod-validated plugin configuration + provider config
 * [POS]: Configuration loading and validation for the ohmymkt plugin
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import path from "node:path";
import { z } from "zod";
import { templatePaths, RUNTIME_DIR_NAME, type TemplatePaths } from "./domain/constants";
import { readJsonFile } from "./domain/io";

/* ------------------------------------------------------------------ */
/*  Schema                                                             */
/* ------------------------------------------------------------------ */

export const PluginConfigSchema = z.object({
  disabled_tools: z.array(z.string()).optional().default([]),
  disabled_hooks: z.array(z.string()).optional().default([]),
});

export type PluginConfig = z.infer<typeof PluginConfigSchema>;

/* ------------------------------------------------------------------ */
/*  Provider config types                                              */
/* ------------------------------------------------------------------ */

export interface ProviderEntry {
  provider: string;
  api_key_env?: string;
  url?: string;
  project_path?: string;
  options?: Record<string, unknown>;
}

export interface ProvidersConfig {
  image?: ProviderEntry;
  video?: ProviderEntry;
  video_template?: ProviderEntry;
  publish?: Record<string, ProviderEntry>;
}

/* ------------------------------------------------------------------ */
/*  Resolved config (includes computed paths)                          */
/* ------------------------------------------------------------------ */

export interface ResolvedConfig extends PluginConfig {
  projectRoot: string;
  templatePaths: TemplatePaths;
  providers: ProvidersConfig;
}

/* ------------------------------------------------------------------ */
/*  Loader                                                             */
/* ------------------------------------------------------------------ */

export function loadProvidersConfig(projectRoot: string): ProvidersConfig {
  const file = path.join(projectRoot, RUNTIME_DIR_NAME, "providers.json");
  return readJsonFile<ProvidersConfig>(file, {});
}

export function loadPluginConfig(directory: string): ResolvedConfig {
  const pluginDir = decodeURIComponent(path.resolve(path.dirname(new URL(import.meta.url).pathname), ".."));
  const tpl = templatePaths(pluginDir);

  return {
    disabled_tools: [],
    disabled_hooks: [],
    projectRoot: directory,
    templatePaths: tpl,
    providers: loadProvidersConfig(directory),
  };
}
