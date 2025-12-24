import { query, type SDKResultMessage, type SDKSystemMessage } from "@anthropic-ai/claude-agent-sdk";
import {
  MCP_SERVER_PATH,
  MCP_SERVER_NAME,
  UMBRACO_CLIENT_ID,
  UMBRACO_CLIENT_SECRET,
  UMBRACO_BASE_URL,
  DEFAULT_MODEL,
  DEFAULT_MAX_TURNS,
  DEFAULT_MAX_BUDGET_USD,
  getToolsString
} from "./config.js";
import type { AgentTestResult, AgentTestOptions, ToolCall } from "./types.js";

/**
 * Runs an e2e test with the Agent SDK
 *
 * @param prompt - The prompt to send to the agent
 * @param tools - Tools to make available (string or array)
 * @param options - Optional test configuration
 * @returns Test result with tool calls, results, and metadata
 */
export async function runAgentTest(
  prompt: string,
  tools: string | readonly string[],
  options?: AgentTestOptions
): Promise<AgentTestResult> {
  const toolCalls: ToolCall[] = [];
  const toolResults: unknown[] = [];
  let result: SDKResultMessage | undefined;
  let initMessage: SDKSystemMessage | undefined;

  const toolsString = Array.isArray(tools) ? getToolsString(tools) : tools;

  for await (const message of query({
    prompt,
    options: {
      model: options?.model ?? DEFAULT_MODEL,
      cwd: process.cwd(),
      mcpServers: {
        [MCP_SERVER_NAME]: {
          type: "stdio",
          command: "node",
          args: [MCP_SERVER_PATH],
          env: {
            UMBRACO_CLIENT_ID,
            UMBRACO_CLIENT_SECRET,
            UMBRACO_BASE_URL,
            UMBRACO_INCLUDE_TOOLS: toolsString,
            NODE_TLS_REJECT_UNAUTHORIZED: "0"
          }
        }
      },
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
      tools: [],
      maxTurns: options?.maxTurns ?? DEFAULT_MAX_TURNS,
      maxBudgetUsd: options?.maxBudget ?? DEFAULT_MAX_BUDGET_USD,
      ...(options?.onStderr && { stderr: options.onStderr })
    }
  })) {
    // Callback for message monitoring
    if (options?.onMessage) {
      options.onMessage(message);
    }

    // Capture init message
    if (message.type === "system" && message.subtype === "init") {
      initMessage = message;
    }

    // Track tool calls
    if (message.type === "assistant" && message.message.content) {
      for (const block of message.message.content) {
        if (block.type === "tool_use") {
          toolCalls.push({
            name: block.name,
            input: block.input
          });
        }
      }
    }

    // Capture tool results
    if (message.type === "user" && message.tool_use_result) {
      toolResults.push(message.tool_use_result);
    }

    // Capture final result
    if (message.type === "result") {
      result = message;
    }
  }

  return {
    toolCalls,
    toolResults,
    finalResult: result?.subtype === "success" ? result.result : "",
    success: result?.subtype === "success",
    cost: result?.subtype === "success" ? result.total_cost_usd : 0,
    turns: result?.subtype === "success" ? result.num_turns : 0,
    availableTools: initMessage?.tools ?? []
  };
}

/**
 * Gets the short tool name without MCP prefix
 */
export function getShortToolName(fullName: string): string {
  return fullName.replace(`mcp__${MCP_SERVER_NAME}__`, "");
}

/**
 * Gets the full MCP tool name from short name
 */
export function getFullToolName(shortName: string): string {
  return `mcp__${MCP_SERVER_NAME}__${shortName}`;
}

/**
 * Formats tool calls for logging
 */
export function formatToolCalls(toolCalls: ToolCall[]): string {
  return toolCalls.map(tc => getShortToolName(tc.name)).join(", ");
}

/**
 * Logs test result summary to console
 */
export function logTestResult(result: AgentTestResult, testName?: string): void {
  if (testName) {
    console.log(`\n=== ${testName} ===`);
  }
  console.log(`Tools available: ${result.availableTools.map(getShortToolName).join(", ")}`);
  console.log(`Tools called: ${formatToolCalls(result.toolCalls)}`);
  console.log(`Final result preview: ${result.finalResult.substring(0, 200)}${result.finalResult.length > 200 ? "..." : ""}`);
  console.log(`Cost: $${result.cost.toFixed(4)}`);
  console.log(`Turns: ${result.turns}`);
  console.log(`Success: ${result.success}`);
}
