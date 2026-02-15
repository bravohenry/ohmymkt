/**
 * [INPUT]: ResolvedConfig from plugin-config, all agent factory functions
 * [OUTPUT]: Agent config records for OpenCode
 * [POS]: Agent registration assembly, wires agent definitions into OpenCode config
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import type { AgentConfig } from "@opencode-ai/sdk";
import type { ResolvedConfig } from "./plugin-config";
import { createGrowthManagerAgent } from "./agents/growth-manager";
import { createSeoEngineerAgent } from "./agents/seo-engineer";
import { createContentOpsAgent } from "./agents/content-ops";
import { createContentWriterAgent } from "./agents/content-writer";
import { createAeoSpecialistAgent } from "./agents/aeo-specialist";
import { createGrowthAnalystAgent } from "./agents/growth-analyst";
import { createResearchAgent } from "./agents/research-agent";

const DEFAULT_MODEL = "default/claude-opus-4-6-thinking";
const SONNET_MODEL = "default/claude-sonnet-4-5-20250929";

export function createAgents(
  config: ResolvedConfig,
): Record<string, AgentConfig> {
  const model = DEFAULT_MODEL;
  return {
    "growth-manager": createGrowthManagerAgent(model, config),
    "seo-engineer": createSeoEngineerAgent(model),
    "content-ops": createContentOpsAgent(model),
    "content-writer": createContentWriterAgent(SONNET_MODEL),
    "aeo-specialist": createAeoSpecialistAgent(model),
    "growth-analyst": createGrowthAnalystAgent(model),
    "research-agent": createResearchAgent(model),
  };
}
