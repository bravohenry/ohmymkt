/**
 * [INPUT]: Domain incidents module (registerIncident)
 * [OUTPUT]: createIncidentTool factory returning ohmymkt_incident tool
 * [POS]: Incident registration tool, records P0/P1/P2 events for cycle decisions
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import { tool } from "@opencode-ai/plugin/tool";
import type { ToolDefinition } from "@opencode-ai/plugin";
import type { ResolvedConfig } from "../plugin-config";
import { registerIncident } from "../domain/incidents";

export function createIncidentTool(config: ResolvedConfig): ToolDefinition {
  return tool({
    description:
      "Register a growth incident with severity (P0/P1/P2), affected module, and summary. P0 triggers immediate rollback in the next cycle decision.",
    args: {
      severity: tool.schema.enum(["P0", "P1", "P2"]).describe("Incident severity level"),
      module: tool.schema.string().describe("Affected module or track name"),
      summary: tool.schema.string().describe("Brief description of the incident"),
    },
    execute: async (args) => {
      const { record, filePath } = registerIncident(config.projectRoot, {
        severity: args.severity,
        module: args.module,
        summary: args.summary,
      });
      return `Incident registered: ${record.id}\nSeverity: ${record.severity}\nModule: ${record.module}\nFile: ${filePath}`;
    },
  });
}
