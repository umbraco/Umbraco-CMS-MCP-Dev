import path from "path";
import { ClaudeModels, configureEvals, getDefaultVerbosity } from "@umbraco-cms/mcp-server-sdk/evals";

/**
 * Configure the SDK eval framework with project-specific settings.
 * This runs before any tests via setupFilesAfterEnv in jest.config.ts.
 */
configureEvals({
  mcpServerPath: path.resolve(process.cwd(), "dist/index.js"),
  mcpServerName: "umbraco-mcp",
  serverEnv: {
    UMBRACO_CLIENT_ID: process.env.UMBRACO_CLIENT_ID || "umbraco-back-office-mcp",
    UMBRACO_CLIENT_SECRET: process.env.UMBRACO_CLIENT_SECRET || "1234567890",
    UMBRACO_BASE_URL: process.env.UMBRACO_BASE_URL || "http://localhost:56472",
    NODE_TLS_REJECT_UNAUTHORIZED: "0",
  },
  defaultModel: ClaudeModels.Haiku,
  defaultMaxTurns: 15,
  defaultMaxBudgetUsd: 0.50,
  defaultTimeoutMs: 120000,
  defaultVerbosity: (process.env.E2E_VERBOSITY as "quiet" | "normal" | "verbose") || "quiet",
});

// Track test results for summary
let testResults: { name: string; passed: boolean }[] = [];
let startTime: number;
let headerPrinted = false;

// Print header once at start
beforeAll(() => {
  const verbosity = getDefaultVerbosity();
  if (verbosity === "quiet" && !headerPrinted) {
    headerPrinted = true;
    startTime = Date.now();
    console.log(`\uD83E\uDD16 LLM Evaluation Tests`);
  }
});

// Track each test result
afterEach(() => {
  const verbosity = getDefaultVerbosity();
  if (verbosity === "quiet") {
    const testState = expect.getState();
    const passed = testState.numPassingAsserts > 0 || !testState.assertionCalls || testState.assertionCalls === testState.numPassingAsserts;
    const testName = testState.currentTestName || "Unknown test";

    // Only track if we haven't already (avoid duplicates)
    if (!testResults.find(r => r.name === testName)) {
      testResults.push({ name: testName, passed });
      const icon = passed ? "\u2705" : "\u274C";
      const status = passed ? "PASSED" : "FAILED";
      console.log(`${icon} ${testName}: ${status}`);
    }
  }
});

// Print summary at end
afterAll(() => {
  const verbosity = getDefaultVerbosity();
  if (verbosity === "quiet") {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const passed = testResults.filter(r => r.passed).length;
    const total = testResults.length;
    console.log(`\n\uD83D\uDCCA Results: ${passed}/${total} tests passed (${elapsed}s)`);

    // Reset for next test file
    testResults = [];
    headerPrinted = false;
  }
});
