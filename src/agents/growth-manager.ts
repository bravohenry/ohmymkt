/**
 * [INPUT]: ResolvedConfig from plugin-config, buildGrowthManagerPrompt from prompt-builder
 * [OUTPUT]: createGrowthManagerAgent() — primary orchestration agent config
 * [POS]: Primary agent definition, the default agent OpenCode loads for ohmymkt sessions
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import type { AgentConfig } from "@opencode-ai/sdk";
import type { ResolvedConfig } from "../plugin-config";
import { buildGrowthManagerPrompt } from "./prompt-builder";

export function createGrowthManagerAgent(
  model: string,
  config: ResolvedConfig,
): AgentConfig {
  return {
    description: "Primary growth orchestration agent — plans, gates, dual-track execution, cycle decisions",
    mode: "primary",
    model,
    temperature: 0.2,
    thinking: { type: "enabled", budgetTokens: 32000 },
    prompt: buildGrowthManagerPrompt(config),
  } as AgentConfig;
}
