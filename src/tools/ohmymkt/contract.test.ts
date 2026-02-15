import fs from "node:fs"
import os from "node:os"
import path from "node:path"

import { describe, expect, test } from "bun:test"

import { createOhmymktTools } from "./index"

const TOOL_TOKEN_PATTERN = /ohmymkt_[a-z0-9_]+/g

function walkMarkdownFiles(rootDir: string): string[] {
  if (!fs.existsSync(rootDir)) return []

  const files: string[] = []
  const stack = [rootDir]

  while (stack.length > 0) {
    const current = stack.pop() as string
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name)
      if (entry.isDirectory()) {
        stack.push(fullPath)
        continue
      }
      if (entry.isFile() && fullPath.endsWith(".md")) {
        files.push(fullPath)
      }
    }
  }

  return files
}

describe("ohmymkt tools contract", () => {
  test("all ohmymkt_* tokens referenced by agents/skills are registered", () => {
    const repoRoot = process.cwd()
    const markdownFiles = [
      ...walkMarkdownFiles(path.join(repoRoot, ".claude", "agents")),
      ...walkMarkdownFiles(path.join(repoRoot, ".opencode", "skills")),
    ]

    const referencedTools = new Set<string>()
    for (const filePath of markdownFiles) {
      const content = fs.readFileSync(filePath, "utf8")
      const matches = content.match(TOOL_TOKEN_PATTERN) ?? []
      for (const token of matches) {
        referencedTools.add(token)
      }
    }

    expect(referencedTools.size).toBeGreaterThan(0)

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "omo-ohmymkt-contract-"))
    const registered = new Set(Object.keys(createOhmymktTools({ directory: tempDir })))
    fs.rmSync(tempDir, { recursive: true, force: true })

    const missing = [...referencedTools].filter((toolName) => !registered.has(toolName))
    expect(missing).toEqual([])
  })
})
