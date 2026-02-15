import { existsSync, readdirSync, readFileSync } from "fs"
import { join, basename } from "path"
import type { AgentConfig } from "@opencode-ai/sdk"
import { parseFrontmatter } from "../../shared/frontmatter"
import { isMarkdownFile } from "../../shared/file-utils"
import { getClaudeConfigDir } from "../../shared"
import type { AgentScope, AgentFrontmatter, LoadedAgent } from "./types"

function parseToolsConfig(toolsValue?: string | string[]): Record<string, boolean> | undefined {
  if (!toolsValue) return undefined

  const rawTools = Array.isArray(toolsValue)
    ? toolsValue
    : toolsValue.split(",")

  const tools = rawTools.map((tool) => String(tool).trim()).filter(Boolean)
  if (tools.length === 0) return undefined

  const result: Record<string, boolean> = {}
  for (const tool of tools) {
    result[tool.toLowerCase()] = true
  }
  return result
}

function loadAgentsFromDir(agentsDir: string, scope: AgentScope): LoadedAgent[] {
  if (!existsSync(agentsDir)) {
    return []
  }

  const entries = readdirSync(agentsDir, { withFileTypes: true })
  const agents: LoadedAgent[] = []

  for (const entry of entries) {
    if (!isMarkdownFile(entry)) continue

    const agentPath = join(agentsDir, entry.name)
    const agentName = basename(entry.name, ".md")

    try {
      const content = readFileSync(agentPath, "utf-8")
      const { data, body } = parseFrontmatter<AgentFrontmatter>(content)

      const name = data.name || agentName
      const originalDescription = data.description || ""

      const formattedDescription = `(${scope}) ${originalDescription || name}`
      const mode = data.mode === "primary" ? "primary" : "subagent"

      const config: AgentConfig = {
        description: formattedDescription,
        mode,
        prompt: body.trim(),
      }

      if (data.model) {
        config.model = data.model
      }
      if (typeof data.temperature === "number") {
        config.temperature = data.temperature
      }

      const toolsConfig = parseToolsConfig(data.tools)
      if (toolsConfig) {
        config.tools = toolsConfig
      }

      agents.push({
        name,
        path: agentPath,
        config,
        scope,
      })
    } catch {
      continue
    }
  }

  return agents
}

export function loadUserAgents(): Record<string, AgentConfig> {
  const userAgentsDir = join(getClaudeConfigDir(), "agents")
  const agents = loadAgentsFromDir(userAgentsDir, "user")

  const result: Record<string, AgentConfig> = {}
  for (const agent of agents) {
    result[agent.name] = agent.config
  }
  return result
}

export function loadProjectAgents(): Record<string, AgentConfig> {
  const projectAgentsDir = join(process.cwd(), ".claude", "agents")
  const agents = loadAgentsFromDir(projectAgentsDir, "project")

  const result: Record<string, AgentConfig> = {}
  for (const agent of agents) {
    result[agent.name] = agent.config
  }
  return result
}
