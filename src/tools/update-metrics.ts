/**
 * [INPUT]: Domain io (readJsonFile, writeJsonFile, nowIso), domain constants (runtimePaths)
 * [OUTPUT]: createUpdateMetricsTool factory returning ohmymkt_update_metrics tool
 * [POS]: Metrics state mutation tool, allows agent to update track metrics and trends
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import { tool } from "@opencode-ai/plugin/tool";
import type { ToolDefinition } from "@opencode-ai/plugin";
import type { ResolvedConfig } from "../plugin-config";
import { runtimePaths } from "../domain/constants";
import { readJsonFile, writeJsonFile, nowIso } from "../domain/io";

export function createUpdateMetricsTool(config: ResolvedConfig): ToolDefinition {
  return tool({
    description:
      "Update a metric within a track. Tracks: visibility_track, quality_track. Set the metric name, its value, and trend direction (up/down/flat).",
    args: {
      track: tool.schema.string().describe("Track key, e.g. 'visibility_track'"),
      metric: tool.schema.string().describe("Metric name, e.g. 'non_brand_visibility'"),
      value: tool.schema.string().describe("Metric value"),
      trend: tool.schema.string().describe("Trend direction: up, down, or flat"),
    },
    execute: async (args) => {
      const runtime = runtimePaths(config.projectRoot);
      const metrics = readJsonFile<Record<string, unknown>>(runtime.metricsFile, {});
      const trackObj = (metrics[args.track] ?? {}) as Record<string, unknown>;
      trackObj[args.metric] = args.value;
      trackObj[`${args.metric}_trend`] = args.trend;
      metrics[args.track] = trackObj;
      metrics.updated_at = nowIso();

      writeJsonFile(runtime.metricsFile, metrics);
      return `Updated ${args.track}.${args.metric} = ${args.value} (trend: ${args.trend})`;
    },
  });
}
