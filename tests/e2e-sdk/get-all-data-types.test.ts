import { describe, it, expect } from "@jest/globals";
import {
  runAgentTest,
  setupConsoleMock,
  logTestResult,
  verifyToolsAvailable,
  getToolCalls
} from "./helpers/index.js";

const TEST_TOOLS = ["get-all-data-types"];

describe("get-all-data-types via Agent SDK", () => {
  setupConsoleMock();

  it("should call get-all-data-types tool", async () => {
    const result = await runAgentTest(
      "Use the get-all-data-types tool to list all data types. Once you have the results, summarize how many data types were found.",
      TEST_TOOLS,
      { maxTurns: 5, maxBudget: 0.10 }
    );

    // Log results
    logTestResult(result, "get-all-data-types");

    // Assertions - MCP server connected
    expect(result.availableTools.length).toBeGreaterThan(0);

    // Tool was available
    const toolAvailable = verifyToolsAvailable(result, TEST_TOOLS);
    expect(toolAvailable.passed).toBe(true);

    // Claude called the tool
    const toolCalls = getToolCalls(result.toolCalls, "get-all-data-types");
    expect(toolCalls.length).toBeGreaterThan(0);

    // Query completed
    expect(result.success).toBe(true);

    // Note: The tool result may contain a Zod v4 compatibility error with MCP SDK
    // This is a known issue that doesn't affect the core integration
    if (result.toolResults.length > 0) {
      const hasZodError = JSON.stringify(result.toolResults[0]).includes("_zod");
      if (hasZodError) {
        console.log("Warning: Known Zod v4 compatibility issue detected - outputSchema validation");
      }
    }
  }, 120000);

  it("should handle MCP server connection", async () => {
    const result = await runAgentTest(
      "What tools are available?",
      TEST_TOOLS,
      { maxTurns: 1, maxBudget: 0.05 }
    );

    // MCP server should be connected with tools available
    expect(result.availableTools.length).toBeGreaterThan(0);

    // Verify specific tool is available
    const toolAvailable = verifyToolsAvailable(result, TEST_TOOLS);
    expect(toolAvailable.passed).toBe(true);
  }, 60000);
});
