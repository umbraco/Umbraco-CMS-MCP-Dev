import { jest } from "@jest/globals";
import { runAgentTest, logTestResult } from "./agent-runner.js";
import { verifyRequiredToolCalls, verifySuccessMessage } from "./verification.js";
import { DEFAULT_TIMEOUT_MS, TEST_DELAY_MS } from "./config.js";
import { waitForRateLimit, recordTokenUsage } from "./rate-limiter.js";
import type { TestScenario } from "./types.js";

/**
 * Creates a Jest test from a scenario
 *
 * Usage:
 * ```typescript
 * describe("my tests", () => {
 *   createScenarioTest({
 *     name: "should create and delete a data type",
 *     prompt: `Complete these tasks:
 *       1. Create a data type called '_Test'
 *       2. Delete the data type
 *       3. Say 'The task has completed successfully'`,
 *     tools: ["create-data-type", "delete-data-type"],
 *     requiredTools: ["create-data-type", "delete-data-type"],
 *     successPattern: "task has completed successfully",
 *     verbose: true  // or debug: true - see full conversation trace
 *   });
 * });
 * ```
 */
export function createScenarioTest(
  scenario: TestScenario,
  timeout: number = DEFAULT_TIMEOUT_MS
): void {
  it(scenario.name, async () => {
    // Check rate limit before starting
    await waitForRateLimit();

    console.log(`Starting test: ${scenario.name}`);

    const result = await runAgentTest(
      scenario.prompt,
      scenario.tools,
      { ...scenario.options, verbose: scenario.verbose || scenario.debug }
    );

    // Record token usage for rate limiting
    recordTokenUsage(result.tokens.input, result.tokens.output);

    logTestResult(result, scenario.name);

    // Verify required tools were called
    const toolVerification = verifyRequiredToolCalls(result.toolCalls, scenario.requiredTools);
    if (!toolVerification.passed) {
      console.log(`Missing required tools: ${toolVerification.missing.join(", ")}`);
    }
    expect(toolVerification.passed).toBe(true);

    // Verify success pattern if specified
    if (scenario.successPattern) {
      const matched = verifySuccessMessage(result.finalResult, scenario.successPattern);
      expect(matched).toBe(true);
    }

    expect(result.success).toBe(true);
  }, timeout);
}

/**
 * Helper to delay execution (for rate limiting)
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Setup helper for beforeEach/afterEach console mocking and rate limit delays
 *
 * Set E2E_TEST_DELAY_MS environment variable to add delay between tests.
 * Example: E2E_TEST_DELAY_MS=60000 for 1 minute delay between tests.
 */
export function setupConsoleMock(): void {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    console.error = originalConsoleError;

    // Add delay between tests if configured (for rate limiting)
    if (TEST_DELAY_MS > 0) {
      console.log(`Waiting ${TEST_DELAY_MS}ms before next test (rate limit delay)...`);
      await delay(TEST_DELAY_MS);
    }
  });
}
