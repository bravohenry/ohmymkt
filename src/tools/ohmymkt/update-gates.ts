/**
 * [INPUT]: Domain gates (loadGateState), domain io (writeJsonFile), domain constants (runtimePaths)
 * [OUTPUT]: createUpdateGatesTool factory returning ohmymkt_update_gates tool
 * [POS]: Gate state mutation tool, allows agent to update individual gate fields
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import { tool } from "@opencode-ai/plugin/tool";
import type { ToolDefinition } from "@opencode-ai/plugin";
import type { ResolvedConfig } from "./config";
import { loadGateState } from "./runtime/gates";
import { runtimePaths } from "./runtime/constants";
import { writeJsonFile, nowIso } from "./runtime/io";

function parseValue(raw: string): unknown {
  if (raw === "true") return true;
  if (raw === "false") return false;
  const num = Number(raw);
  if (!Number.isNaN(num) && raw.trim() !== "") return num;
  return raw;
}

export function createUpdateGatesTool(config: ResolvedConfig): ToolDefinition {
  return tool({
    description:
      "Update a specific field on a startup gate. Gate keys: strategy_gate, compliance_gate, capacity_gate, data_gate, ownership_gate. Values are auto-parsed (boolean, number, or string).",
    args: {
      gate: tool.schema.string().describe("Gate key, e.g. 'strategy_gate'"),
      field: tool.schema.string().describe("Field name within the gate, e.g. 'approved'"),
      value: tool.schema.string().describe("New value (auto-parsed to boolean/number/string)"),
    },
    execute: async (args) => {
      const state = loadGateState(config.projectRoot, config.templatePaths);
      const gateObj = (state[args.gate] ?? {}) as Record<string, unknown>;
      gateObj[args.field] = parseValue(args.value);
      state[args.gate] = gateObj;
      state.updated_at = nowIso();

      const runtime = runtimePaths(config.projectRoot);
      writeJsonFile(runtime.gatesFile, state);
      return `Updated ${args.gate}.${args.field} = ${args.value}`;
    },
  });
}
