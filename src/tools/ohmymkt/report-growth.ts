/**
 * [INPUT]: Domain reports module (generateGrowthReport)
 * [OUTPUT]: createReportGrowthTool factory returning ohmymkt_report_growth tool
 * [POS]: Reporting tool, produces windowed growth summaries for review
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import { tool } from "@opencode-ai/plugin/tool";
import type { ToolDefinition } from "@opencode-ai/plugin";
import type { ResolvedConfig } from "./config";
import { generateGrowthReport } from "./runtime/reports";

export function createReportGrowthTool(config: ResolvedConfig): ToolDefinition {
  return tool({
    description:
      "Generate a growth summary report over a time window. Aggregates cycle decisions, incident counts, and gate status into a single report file.",
    args: {
      window: tool.schema.string().optional().describe("Time window like '7d', '30d', '90d' (default '7d')"),
    },
    execute: async (args) => {
      const result = generateGrowthReport(config.projectRoot, args.window || "7d", config.templatePaths);
      const ic = result.incidentCount;
      const dc = result.decisionCount;
      return [
        `Growth report generated (${result.days}d window)`,
        `Gates: ${result.gatesPassed ? "PASS" : "FAIL"}`,
        `Decisions — continue: ${dc.continue}, intervene: ${dc.intervene}, rollback: ${dc.rollback}`,
        `Incidents — P0: ${ic.p0}, P1: ${ic.p1}, P2: ${ic.p2}`,
        `File: ${result.filePath}`,
      ].join("\n");
    },
  });
}
