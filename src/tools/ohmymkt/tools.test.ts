import fs from "node:fs"
import os from "node:os"
import path from "node:path"

import { afterEach, beforeEach, describe, expect, test } from "bun:test"

import { createOhmymktTools } from "./index"

const TOOL_NAMES = [
  "ohmymkt_plan_growth",
  "ohmymkt_check_gates",
  "ohmymkt_start_campaign",
  "ohmymkt_run_cycle",
  "ohmymkt_incident",
  "ohmymkt_report_growth",
  "ohmymkt_list_plans",
  "ohmymkt_update_gates",
  "ohmymkt_update_metrics",
  "ohmymkt_read_state",
  "ohmymkt_research_brief",
  "ohmymkt_save_positioning",
  "ohmymkt_asset_manifest",
  "ohmymkt_provider_config",
  "ohmymkt_generate_image",
  "ohmymkt_generate_video",
  "ohmymkt_publish",
  "ohmymkt_competitor_profile",
]

let tempDir = ""

function runtimePath(file: string): string {
  return path.join(tempDir, ".ohmymkt", file)
}

describe("ohmymkt tool registry", () => {
  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "omo-ohmymkt-tools-"))
  })

  afterEach(() => {
    if (tempDir) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  test("registers all 18 marketing tools", () => {
    const tools = createOhmymktTools({ directory: tempDir })

    expect(Object.keys(tools).sort()).toEqual([...TOOL_NAMES].sort())
  })

  test("core tools execute with expected runtime outputs", async () => {
    const tools = createOhmymktTools({ directory: tempDir })

    const planOutput = await tools.ohmymkt_plan_growth.execute({
      goal: "Increase qualified demo requests",
      name: "demo-growth-q1",
    } as never, {} as never)
    expect(planOutput).toContain("Plan created")
    expect(fs.existsSync(runtimePath("plans/demo-growth-q1.md"))).toBe(true)

    const gateOutput = await tools.ohmymkt_check_gates.execute({} as never, {} as never)
    expect(gateOutput).toContain("Gate Status")

    const cycleOutput = await tools.ohmymkt_run_cycle.execute({ cadence: "weekly" } as never, {} as never)
    expect(cycleOutput).toContain("Decision:")
    expect(cycleOutput).toContain("Report:")

    const publishOutput = await tools.ohmymkt_publish.execute(
      { platform: "twitter", content: "hello" } as never,
      {} as never,
    )
    expect(publishOutput).toContain("not configured")
  })
})
