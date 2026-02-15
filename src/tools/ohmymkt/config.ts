import path from "node:path"

import { templatePaths, RUNTIME_DIR_NAME, type TemplatePaths } from "./runtime/constants"
import { readJsonFile } from "./runtime/io"

export interface ProviderEntry {
  provider: string
  api_key_env?: string
  url?: string
  project_path?: string
  options?: Record<string, unknown>
}

export interface ProvidersConfig {
  image?: ProviderEntry
  video?: ProviderEntry
  video_template?: ProviderEntry
  publish?: Record<string, ProviderEntry>
}

export interface ResolvedConfig {
  projectRoot: string
  templatePaths: TemplatePaths
  providers: ProvidersConfig
}

export function loadProvidersConfig(projectRoot: string): ProvidersConfig {
  const file = path.join(projectRoot, RUNTIME_DIR_NAME, "providers.json")
  return readJsonFile<ProvidersConfig>(file, {})
}

export function resolveOhmymktConfig(directory: string): ResolvedConfig {
  const toolRoot = decodeURIComponent(path.resolve(path.dirname(new URL(import.meta.url).pathname)))

  return {
    projectRoot: directory,
    templatePaths: templatePaths(toolRoot),
    providers: loadProvidersConfig(directory),
  }
}
