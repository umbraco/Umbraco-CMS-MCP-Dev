import { jest } from "@jest/globals";
import { runAgentTest, logTestResult } from "./agent-runner.js";
import { verifyRequiredToolCalls, verifySuccessMessage } from "./verification.js";
import { DEFAULT_TIMEOUT_MS, getToolsString } from "./config.js";
import type { TestScenario, TestScenarioResult, AgentTestResult } from "./types.js";

/**
 * Runs a test scenario and returns comprehensive results
 */
export async function runScenario(scenario: TestScenario): Promise<TestScenarioResult> {
  const toolsString = Array.isArray(scenario.tools)
    ? getToolsString(scenario.tools)
    : scenario.tools;

  const result = await runAgentTest(
    scenario.prompt,
    toolsString,
    scenario.options
  );

  const toolVerification = verifyRequiredToolCalls(result.toolCalls, scenario.requiredTools);

  let successPatternMatched: boolean | undefined;
  if (scenario.successPattern) {
    successPatternMatched = verifySuccessMessage(result.finalResult, scenario.successPattern);
  }

  return {
    ...result,
    scenario,
    toolVerification,
    successPatternMatched
  };
}

/**
 * Creates a Jest test from a scenario
 *
 * Usage:
 * ```typescript
 * describe("my tests", () => {
 *   createScenarioTest({
 *     name: "should do something",
 *     prompt: "Do something...",
 *     tools: TOOL_SETS.dataType,
 *     requiredTools: ["create-data-type"],
 *     successPattern: "completed successfully"
 *   });
 * });
 * ```
 */
export function createScenarioTest(
  scenario: TestScenario,
  timeout: number = DEFAULT_TIMEOUT_MS
): void {
  it(scenario.name, async () => {
    console.log(`Starting test: ${scenario.name}`);
    const result = await runScenario(scenario);

    // Log results
    logTestResult(result, scenario.name);

    // Assertions
    if (!result.toolVerification.passed) {
      console.log(`Missing required tools: ${result.toolVerification.missing.join(", ")}`);
    }
    expect(result.toolVerification.passed).toBe(true);

    if (scenario.successPattern) {
      expect(result.successPatternMatched).toBe(true);
    }

    expect(result.success).toBe(true);
  }, timeout);
}

/**
 * Creates multiple Jest tests from scenarios
 */
export function createScenarioTests(
  scenarios: TestScenario[],
  timeout: number = DEFAULT_TIMEOUT_MS
): void {
  for (const scenario of scenarios) {
    createScenarioTest(scenario, timeout);
  }
}

/**
 * Setup helper for beforeEach/afterEach console mocking
 *
 * Usage:
 * ```typescript
 * describe("my tests", () => {
 *   const consoleMock = setupConsoleMock();
 *   // tests...
 * });
 * ```
 */
export function setupConsoleMock(): { restore: () => void } {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  return {
    restore: () => {
      console.error = originalConsoleError;
    }
  };
}

/**
 * Builder for creating test scenarios fluently
 *
 * Usage:
 * ```typescript
 * const scenario = new ScenarioBuilder("create data type")
 *   .withPrompt("Create a textbox data type...")
 *   .withTools(TOOL_SETS.dataType)
 *   .requireTools(["create-data-type", "delete-data-type"])
 *   .expectSuccess()
 *   .build();
 * ```
 */
export class ScenarioBuilder {
  private scenario: Partial<TestScenario>;

  constructor(name: string) {
    this.scenario = { name };
  }

  withPrompt(prompt: string): this {
    this.scenario.prompt = prompt;
    return this;
  }

  withTools(tools: string | string[]): this {
    this.scenario.tools = tools;
    return this;
  }

  requireTools(tools: string[]): this {
    this.scenario.requiredTools = tools;
    return this;
  }

  expectSuccess(pattern?: RegExp | string): this {
    this.scenario.successPattern = pattern ?? "task has completed successfully";
    return this;
  }

  withMaxTurns(turns: number): this {
    this.scenario.options = { ...this.scenario.options, maxTurns: turns };
    return this;
  }

  withMaxBudget(budget: number): this {
    this.scenario.options = { ...this.scenario.options, maxBudget: budget };
    return this;
  }

  build(): TestScenario {
    if (!this.scenario.name || !this.scenario.prompt || !this.scenario.tools || !this.scenario.requiredTools) {
      throw new Error("Scenario must have name, prompt, tools, and requiredTools");
    }
    return this.scenario as TestScenario;
  }
}

/**
 * Shorthand for creating a simple workflow test
 *
 * @param name - Test name
 * @param steps - Numbered list of steps for the agent to complete
 * @param tools - Tools to make available
 * @param requiredTools - Tools that must be called
 * @param timeout - Test timeout in ms
 */
export function workflowTest(
  name: string,
  steps: string[],
  tools: string | readonly string[],
  requiredTools: readonly string[],
  timeout: number = DEFAULT_TIMEOUT_MS
): void {
  const numberedSteps = steps.map((step, i) => `${i + 1}. ${step}`).join("\n");
  const prompt = `Complete these tasks in order:\n${numberedSteps}\n${steps.length + 1}. When successfully completed the tasks, say 'The task has completed successfully', nothing else`;

  createScenarioTest(
    {
      name,
      prompt,
      tools,
      requiredTools,
      successPattern: "task has completed successfully"
    },
    timeout
  );
}
