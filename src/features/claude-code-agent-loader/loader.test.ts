import fs from "node:fs"
import os from "node:os"
import path from "node:path"

import { afterEach, beforeEach, describe, expect, test } from "bun:test"

import { loadProjectAgents } from "./loader"

let tempDir = ""
let originalCwd = ""

function writeAgentFile(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, content, "utf8")
}

describe("claude-code-agent-loader", () => {
  beforeEach(() => {
    originalCwd = process.cwd()
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "omo-agent-loader-"))
  })

  afterEach(() => {
    process.chdir(originalCwd)
    if (tempDir) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  test("ignores AGENTS.md/README.md and only loads valid agent markdown", () => {
    const agentsDir = path.join(tempDir, ".claude", "agents")

    writeAgentFile(
      path.join(agentsDir, "AGENTS.md"),
      "---\nname: AGENTS\ndescription: docs\n---\n# docs only",
    )
    writeAgentFile(
      path.join(agentsDir, "README.md"),
      "---\nname: README\ndescription: docs\n---\n# docs only",
    )
    writeAgentFile(
      path.join(agentsDir, "growth-manager.md"),
      "---\nname: growth-manager\ndescription: growth primary\n---\nUse marketing flow",
    )
    writeAgentFile(path.join(agentsDir, "ignore.txt"), "not markdown")

    process.chdir(tempDir)
    const agents = loadProjectAgents()

    expect(Object.keys(agents)).toEqual(["growth-manager"])
  })

  test("parses mode/model/temperature/tools from frontmatter", () => {
    const agentsDir = path.join(tempDir, ".claude", "agents")

    writeAgentFile(
      path.join(agentsDir, "marketing-manager.md"),
      [
        "---",
        "name: marketing-manager",
        "description: Marketing primary",
        "mode: primary",
        "model: anthropic/claude-opus-4-6",
        "temperature: 0.2",
        "tools:",
        "  - ohmymkt_plan_growth",
        "  - ohmymkt_check_gates",
        "---",
        "Primary prompt",
      ].join("\n"),
    )

    process.chdir(tempDir)
    const agents = loadProjectAgents()
    const config = agents["marketing-manager"]

    expect(config).toBeDefined()
    expect(config.mode).toBe("primary")
    expect(config.model).toBe("anthropic/claude-opus-4-6")
    expect(config.temperature).toBe(0.2)
    expect(config.tools).toEqual({
      ohmymkt_plan_growth: true,
      ohmymkt_check_gates: true,
    })
  })

  test("defaults to subagent mode when mode is not provided", () => {
    const agentsDir = path.join(tempDir, ".claude", "agents")

    writeAgentFile(
      path.join(agentsDir, "research-agent.md"),
      "---\nname: research-agent\ndescription: research\n---\nResearch prompt",
    )

    process.chdir(tempDir)
    const agents = loadProjectAgents()

    expect(agents["research-agent"]?.mode).toBe("subagent")
  })
})
