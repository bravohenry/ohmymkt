/**
 * [INPUT]: Plugin context from @opencode-ai/plugin
 * [OUTPUT]: Fully wired OhmymktPlugin instance
 * [POS]: Plugin factory entry point — the single export OpenCode loads
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import path from "node:path";
import type { Plugin } from "@opencode-ai/plugin";
import { loadPluginConfig } from "./plugin-config";
import { createTools } from "./create-tools";
import { createHooks } from "./create-hooks";

const PLUGIN_ROOT = decodeURIComponent(path.resolve(path.dirname(new URL(import.meta.url).pathname), ".."));
const SKILLS_DIR = path.join(PLUGIN_ROOT, "skills");

/* ------------------------------------------------------------------ */
/*  Plugin factory                                                     */
/* ------------------------------------------------------------------ */

const OhmymktPlugin: Plugin = async (ctx) => {
  const config = loadPluginConfig(ctx.directory);
  const tools = createTools(config);
  const hooks = createHooks(config);

  return {
    tool: tools,

    async config(cfg) {
      const c = cfg as Record<string, unknown>;
      const skills = (c.skills ?? {}) as Record<string, unknown>;
      const existingPaths = (skills.paths ?? []) as string[];
      skills.paths = [...existingPaths, SKILLS_DIR];
      c.skills = skills;
    },

    async event({ event }) {
      for (const hook of hooks.eventHooks) {
        await hook.event(event);
      }
    },

    async "tool.execute.before"(input, output) {
      for (const hook of hooks.beforeHooks) {
        await hook.before(
          input as { tool: string; sessionID: string },
          output as { args: Record<string, unknown> },
        );
      }
    },

    async "tool.execute.after"(input, output) {
      for (const hook of hooks.afterHooks) {
        await hook.after(
          input as { tool: string; sessionID: string },
          output as { title: string; output: string; metadata: unknown },
        );
      }
    },
  };
};

export default OhmymktPlugin;
