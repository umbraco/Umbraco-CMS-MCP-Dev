import { jest } from "@jest/globals";
import { runAgentTest, logTestResult } from "./agent-runner.js";
import { verifyRequiredToolCalls, verifySuccessMessage } from "./verification.js";
import { getVerbosity } from "./config.js";
import type { TestScenario } from "./types.js";

/**
 * Creates a test body function from a scenario (for IDE test discovery)
 *
 * Usage:
 * ```typescript
 * describe("my tests", () => {
 *   it("should create and delete a data type",
 *     runScenarioTest({
 *       prompt: `Complete these tasks:
 *         1. Create a data type called '_Test'
 *         2. Delete the data type
 *         3. Say 'The task has completed successfully'`,
 *       tools: ["create-data-type", "delete-data-type"],
 *       requiredTools: ["create-data-type", "delete-data-type"],
 *       successPattern: "task has completed successfully",
 *       verbose: true
 *     }),
 *     120000
 *   );
 * });
 * ```
 */
export function runScenarioTest(
  scenario: Omit<TestScenario, "name">
): () => Promise<void> {
  return async () => {
    const verbosity = getVerbosity({
      verbose: scenario.verbose || scenario.debug,
      verbosity: scenario.verbosity
    });

    // Only log "Starting test" in normal or verbose mode
    if (verbosity !== "quiet") {
      console.log(`Starting test`);
    }

    const result = await runAgentTest(
      scenario.prompt,
      scenario.tools,
      { ...scenario.options, verbosity }
    );

    // Only show detailed result in normal or verbose mode
    if (verbosity !== "quiet") {
      logTestResult(result);
    }

    // Verify required tools were called
    const toolVerification = verifyRequiredToolCalls(result.toolCalls, scenario.requiredTools);
    if (!toolVerification.passed) {
      // Always log missing tools (important for debugging failures)
      console.log(`Missing required tools: ${toolVerification.missing.join(", ")}`);
    }
    expect(toolVerification.passed).toBe(true);

    // Verify success pattern if specified
    if (scenario.successPattern) {
      const matched = verifySuccessMessage(result.finalResult, scenario.successPattern);
      expect(matched).toBe(true);
    }

    expect(result.success).toBe(true);
  };
}


/**
 * Setup helper for beforeEach/afterEach console mocking
 */
export function setupConsoleMock(): void {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });
}
