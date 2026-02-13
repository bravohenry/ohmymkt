#!/usr/bin/env node
/**
 * [INPUT]: Depends on gate, planning, campaign, cycle, incident, and report modules in src/lib.
 * [OUTPUT]: Exports the executable command entrypoint (plan-growth/check-gates/start-campaign/run-cycle/report-growth/incident).
 * [POS]: Main entry file in src, responsible for command routing and terminal interaction.
 * [PROTOCOL]: Update this header when changed, then check AGENTS.md
 */

import { resolveProjectRoot } from "./lib/io.mjs";
import { createPlan } from "./lib/plans.mjs";
import { evaluateCurrentGates, formatGateReport } from "./lib/gates.mjs";
import { startCampaign } from "./lib/campaign.mjs";
import { runCycle } from "./lib/cycle.mjs";
import { registerIncident } from "./lib/incidents.mjs";
import { generateGrowthReport } from "./lib/reports.mjs";

function stripSlash(cmd) {
  return String(cmd || "").replace(/^\/+/, "");
}

function parseFlags(args) {
  const flags = {};
  const positional = [];

  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
    if (!token.startsWith("--")) {
      positional.push(token);
      continue;
    }

    const pair = token.slice(2).split("=");
    const key = pair[0];
    if (pair.length > 1) {
      flags[key] = pair.slice(1).join("=");
      continue;
    }

    const next = args[i + 1];
    if (next && !next.startsWith("--")) {
      flags[key] = next;
      i += 1;
    } else {
      flags[key] = true;
    }
  }

  return { flags, positional };
}

function helpText() {
  return `ohmymkt CLI

Usage:
  node ./src/cli.mjs help
  node ./src/cli.mjs plan-growth "<goal>" [--name "custom-plan-name"]
  node ./src/cli.mjs check-gates [--json]
  node ./src/cli.mjs start-campaign [plan-name]
  node ./src/cli.mjs run-cycle <weekly|monthly|quarterly>
  node ./src/cli.mjs incident --severity <P0|P1|P2> --module "<module>" --summary "<summary>"
  node ./src/cli.mjs report-growth [--window 7d|30d|90d]
`;
}

async function main() {
  const projectRoot = resolveProjectRoot(process.cwd());
  const argv = process.argv.slice(2);
  const command = stripSlash(argv[0] || "help");
  const { flags, positional } = parseFlags(argv.slice(1));

  try {
    if (command === "help") {
      console.log(helpText());
      return;
    }

    if (command === "plan-growth") {
      const goal = positional.join(" ").trim();
      if (!goal) {
        throw new Error("plan-growth requires a goal string");
      }
      const result = createPlan(projectRoot, goal, String(flags.name || ""));
      console.log(`Plan created: ${result.filePath}`);
      return;
    }

    if (command === "check-gates") {
      const result = evaluateCurrentGates(projectRoot);
      if (flags.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(formatGateReport(result.evaluations));
        console.log(`\nOverall: ${result.allPassed ? "PASS" : "FAIL"}`);
      }
      process.exitCode = result.allPassed ? 0 : 2;
      return;
    }

    if (command === "start-campaign") {
      const hint = positional.join(" ").trim();
      const result = startCampaign(projectRoot, hint);
      if (!result.ok) {
        console.error(`Blocked: ${result.reason}`);
        console.error(formatGateReport(result.gateResult.evaluations));
        process.exitCode = 2;
        return;
      }
      console.log(`Campaign started with plan: ${result.plan.fileName}`);
      console.log(`Boulder state: ${result.boulder.active_plan}`);
      console.log(`Sprint board size: ${result.sprintSize}`);
      return;
    }

    if (command === "run-cycle") {
      const cadence = positional[0];
      if (!cadence) {
        throw new Error("run-cycle requires cadence: weekly|monthly|quarterly");
      }
      const result = runCycle(projectRoot, cadence);
      console.log(`Cycle report generated: ${result.reportFile}`);
      console.log(`Decision: ${result.decision}`);
      console.log(`Reason: ${result.reason}`);
      return;
    }

    if (command === "incident") {
      const severity = String(flags.severity || "");
      const moduleName = String(flags.module || "unspecified");
      const summary = String(flags.summary || "");
      if (!severity || !summary) {
        throw new Error("incident requires --severity and --summary");
      }
      const result = registerIncident(projectRoot, {
        severity,
        module: moduleName,
        summary,
      });
      console.log(`Incident registered: ${result.record.id}`);
      console.log(`File: ${result.filePath}`);
      return;
    }

    if (command === "report-growth") {
      const windowValue = String(flags.window || "30d");
      const result = generateGrowthReport(projectRoot, windowValue);
      console.log(`Growth report generated: ${result.filePath}`);
      console.log(`Window: ${result.days}d`);
      console.log(`Gate status: ${result.gatesPassed ? "PASS" : "FAIL"}`);
      return;
    }

    throw new Error(`Unknown command: ${command}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.error("\n" + helpText());
    process.exitCode = 1;
  }
}

main();
