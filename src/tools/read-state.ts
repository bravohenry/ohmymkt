/**
 * [INPUT]: Domain io (readJsonFile), domain constants (runtimePaths)
 * [OUTPUT]: createReadStateTool factory returning ohmymkt_read_state tool
 * [POS]: State reader tool, exposes raw runtime state files to the agent
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import { tool } from "@opencode-ai/plugin/tool";
import type { ToolDefinition } from "@opencode-ai/plugin";
import type { ResolvedConfig } from "../plugin-config";
import { runtimePaths } from "../domain/constants";
import { readJsonFile } from "../domain/io";

const FILE_MAP: Record<string, (r: ReturnType<typeof runtimePaths>) => string> = {
  gates: (r) => r.gatesFile,
  metrics: (r) => r.metricsFile,
  modules: (r) => r.modulesFile,
  "sprint-board": (r) => r.sprintBoardFile,
  boulder: (r) => r.boulderFile,
  execution: (r) => r.executionFile,
};

export function createReadStateTool(config: ResolvedConfig): ToolDefinition {
  return tool({
    description:
      "Read a runtime state file. Available files: gates, metrics, modules, sprint-board, boulder, execution. Returns the raw JSON content.",
    args: {
      file: tool.schema
        .enum(["gates", "metrics", "modules", "sprint-board", "boulder", "execution"])
        .describe("State file to read"),
    },
    execute: async (args) => {
      const runtime = runtimePaths(config.projectRoot);
      const resolver = FILE_MAP[args.file];
      const filePath = resolver(runtime);
      const data = readJsonFile<unknown>(filePath, null);
      if (data === null) return `State file '${args.file}' does not exist yet.`;
      return JSON.stringify(data, null, 2);
    },
  });
}
