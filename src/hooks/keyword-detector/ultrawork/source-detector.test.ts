import { describe, expect, test } from "bun:test"

import { getUltraworkMessage } from "./index"
import { getUltraworkSource } from "./source-detector"

describe("ultrawork source routing", () => {
  test("routes growth-manager to marketing source", () => {
    expect(getUltraworkSource("growth-manager", "anthropic/claude-opus-4-6")).toBe("marketing")
  })

  test("keeps non-marketing agents on existing branches", () => {
    expect(getUltraworkSource("prometheus", "anthropic/claude-opus-4-6")).toBe("planner")
    expect(getUltraworkSource("oracle", "openai/gpt-5.2")).toBe("gpt")
    expect(getUltraworkSource("oracle", "anthropic/claude-opus-4-6")).toBe("default")
  })

  test("marketing ultrawork message excludes disabled agents and includes marketing hierarchy", () => {
    const message = getUltraworkMessage("growth-manager", "anthropic/claude-opus-4-6")

    expect(message).toContain("ULTRAWORK MODE ENABLED!")

    expect(message).toContain("requirements-analyst")
    expect(message).toContain("plan-reviewer")
    expect(message).toContain("execution-manager")
    expect(message).toContain("aeo-specialist")
    expect(message).toContain("content-ops")
    expect(message).toContain("content-writer")
    expect(message).toContain("growth-analyst")
    expect(message).toContain("research-agent")
    expect(message).toContain("seo-engineer")

    expect(message.toLowerCase()).not.toContain("oracle")
    expect(message.toLowerCase()).not.toContain("librarian")
    expect(message.toLowerCase()).not.toContain("explore")
    expect(message).not.toContain('subagent_type="plan"')
  })
})
