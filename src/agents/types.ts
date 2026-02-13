/**
 * [INPUT]: None (pure type definitions)
 * [OUTPUT]: GrowthAgentName, AgentMode, AgentMeta types
 * [POS]: Shared type contract for all agent modules in src/agents/
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

export type GrowthAgentName =
  | "growth-manager"
  | "seo-engineer"
  | "content-ops"
  | "content-writer"
  | "aeo-specialist"
  | "growth-analyst";

export type AgentMode = "primary" | "subagent";

export interface AgentMeta {
  name: GrowthAgentName;
  mode: AgentMode;
  description: string;
  triggers: string[];
}
