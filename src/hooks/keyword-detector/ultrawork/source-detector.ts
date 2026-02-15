/**
 * Agent/model detection utilities for ultrawork message routing.
 *
 * Routing logic:
 * 1. Marketing agents (growth-manager, execution-manager, etc.) → marketing.ts
 * 2. Planner agents (prometheus, plan) → planner.ts
 * 3. GPT 5.2 models → gpt5.2.ts
 * 4. Everything else (Claude, etc.) → default.ts
 */

import { isGptModel } from "../../../agents/types"

/**
 * Checks if agent is a planner-type agent.
 * Planners don't need ultrawork injection (they ARE the planner).
 */
export function isPlannerAgent(agentName?: string): boolean {
  if (!agentName) return false
  const lowerName = agentName.toLowerCase()
  if (lowerName.includes("prometheus") || lowerName.includes("planner")) return true

  const normalized = lowerName.replace(/[_-]+/g, " ")
  return /\bplan\b/.test(normalized)
}

export { isGptModel }

/** Ultrawork message source type */
export type UltraworkSource = "marketing" | "planner" | "gpt" | "default"

const MARKETING_AGENT_NAMES = new Set([
  "growth-manager",
  "requirements-analyst",
  "plan-reviewer",
  "execution-manager",
  "aeo-specialist",
  "content-ops",
  "content-writer",
  "growth-analyst",
  "research-agent",
  "seo-engineer",
])

export function isMarketingAgent(agentName?: string): boolean {
  if (!agentName) return false

  const lowerName = agentName.toLowerCase()
  return MARKETING_AGENT_NAMES.has(lowerName)
}

/**
 * Determines which ultrawork message source to use.
 */
export function getUltraworkSource(
  agentName?: string,
  modelID?: string
): UltraworkSource {
  // Priority 0: Marketing agent topology
  if (isMarketingAgent(agentName)) {
    return "marketing"
  }

  // Priority 1: Planner agents
  if (isPlannerAgent(agentName)) {
    return "planner"
  }

  // Priority 2: GPT models
  if (modelID && isGptModel(modelID)) {
    return "gpt"
  }

  // Default: Claude and other models
  return "default"
}
