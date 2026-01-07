import { MCP_SERVER_NAME } from "./config.js";
import type { ToolCall, ToolVerificationResult, AgentTestResult } from "./types.js";

/**
 * Verifies that required tools were called
 *
 * @param toolCalls - List of tool calls made during test
 * @param requiredTools - Short names of tools that must be called
 * @returns Verification result with pass/fail and missing tools
 */
export function verifyRequiredToolCalls(
  toolCalls: ToolCall[],
  requiredTools: readonly string[]
): ToolVerificationResult {
  const calledToolNames = toolCalls.map(tc => tc.name);
  const missing: string[] = [];
  const called: string[] = [];

  for (const tool of requiredTools) {
    const fullToolName = `mcp__${MCP_SERVER_NAME}__${tool}`;
    if (calledToolNames.includes(fullToolName)) {
      called.push(tool);
    } else {
      missing.push(tool);
    }
  }

  return {
    passed: missing.length === 0,
    missing,
    called
  };
}

/**
 * Verifies that the final result contains a success message
 *
 * @param finalResult - The agent's final text response
 * @param customPattern - Optional custom pattern to match
 * @returns Whether the success message was found
 */
export function verifySuccessMessage(
  finalResult: string,
  customPattern?: RegExp | string
): boolean {
  if (customPattern) {
    if (customPattern instanceof RegExp) {
      return customPattern.test(finalResult);
    }
    return finalResult.toLowerCase().includes(customPattern.toLowerCase());
  }
  return finalResult.toLowerCase().includes("task has completed successfully");
}

/**
 * Verifies that the MCP server connected successfully
 *
 * @param result - Agent test result
 * @returns Whether the MCP server connected
 */
export function verifyMcpConnection(result: AgentTestResult): boolean {
  return result.availableTools.length > 0;
}

/**
 * Verifies that specific tools are available
 *
 * @param result - Agent test result
 * @param expectedTools - Short names of tools that should be available
 * @returns Object with passed status and any missing tools
 */
export function verifyToolsAvailable(
  result: AgentTestResult,
  expectedTools: readonly string[]
): { passed: boolean; missing: string[] } {
  const available = new Set(result.availableTools);
  const missing: string[] = [];

  for (const tool of expectedTools) {
    const fullName = `mcp__${MCP_SERVER_NAME}__${tool}`;
    if (!available.has(fullName)) {
      missing.push(tool);
    }
  }

  return {
    passed: missing.length === 0,
    missing
  };
}

/**
 * Checks if a specific tool was called with expected parameters
 *
 * @param toolCalls - List of tool calls
 * @param toolName - Short name of the tool to find
 * @param expectedParams - Optional parameters to verify (partial match)
 * @returns Whether the tool was called with matching params
 */
export function verifyToolCalledWithParams(
  toolCalls: ToolCall[],
  toolName: string,
  expectedParams?: Record<string, unknown>
): boolean {
  const fullName = `mcp__${MCP_SERVER_NAME}__${toolName}`;
  const matchingCalls = toolCalls.filter(tc => tc.name === fullName);

  if (matchingCalls.length === 0) {
    return false;
  }

  if (!expectedParams) {
    return true;
  }

  // Check if any call has matching parameters
  return matchingCalls.some(call => {
    const input = call.input as Record<string, unknown>;
    return Object.entries(expectedParams).every(([key, value]) => {
      return input[key] === value;
    });
  });
}

/**
 * Gets all calls to a specific tool
 *
 * @param toolCalls - List of tool calls
 * @param toolName - Short name of the tool
 * @returns All calls to that tool
 */
export function getToolCalls(
  toolCalls: ToolCall[],
  toolName: string
): ToolCall[] {
  const fullName = `mcp__${MCP_SERVER_NAME}__${toolName}`;
  return toolCalls.filter(tc => tc.name === fullName);
}

/**
 * Comprehensive test assertions helper
 * Use this in Jest tests for common assertion patterns
 */
export function assertTestPassed(
  result: AgentTestResult,
  requiredTools: readonly string[],
  options?: {
    requireSuccessMessage?: boolean;
    customSuccessPattern?: RegExp | string;
    logOnFailure?: boolean;
  }
): void {
  const { requireSuccessMessage = false, customSuccessPattern, logOnFailure = true } = options ?? {};

  // Verify success
  if (!result.success && logOnFailure) {
    console.log("Test failed - Agent did not complete successfully");
    console.log(`Final result: ${result.finalResult}`);
  }
  expect(result.success).toBe(true);

  // Verify required tools
  const toolVerification = verifyRequiredToolCalls(result.toolCalls, requiredTools);
  if (!toolVerification.passed && logOnFailure) {
    console.log(`Missing required tools: ${toolVerification.missing.join(", ")}`);
    console.log(`Tools that were called: ${toolVerification.called.join(", ")}`);
  }
  expect(toolVerification.passed).toBe(true);

  // Verify success message if required
  if (requireSuccessMessage) {
    const hasSuccessMessage = verifySuccessMessage(result.finalResult, customSuccessPattern);
    if (!hasSuccessMessage && logOnFailure) {
      console.log("Expected success message not found in final result");
      console.log(`Final result: ${result.finalResult}`);
    }
    expect(hasSuccessMessage).toBe(true);
  }
}
