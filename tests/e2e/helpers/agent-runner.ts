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
  getToolsString,
  getVerbosity
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

  const toolsString: string = typeof tools === 'string' ? tools : getToolsString(tools);

  const verbosity = getVerbosity(options);
  const isVerbose = verbosity === "verbose";

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
      maxBudgetUsd: options?.maxBudget ?? DEFAULT_MAX_BUDGET_USD
    }
  })) {
    // Capture init message
    if (message.type === "system" && message.subtype === "init") {
      initMessage = message;
      if (isVerbose) {
        console.log("\n[SYSTEM] MCP servers connected");
        console.log(`  Tools: ${message.tools.map(t => getShortToolName(t)).join(", ")}`);
      }
    }

    // Track and log assistant messages
    if (message.type === "assistant" && message.message.content) {
      if (isVerbose) {
        console.log("\n[ASSISTANT]");
      }
      for (const block of message.message.content) {
        if (block.type === "tool_use") {
          toolCalls.push({
            name: block.name,
            input: block.input
          });
          if (isVerbose) {
            console.log(`  Tool call: ${getShortToolName(block.name)}`);
            console.log(`  Input: ${JSON.stringify(block.input, null, 2).split('\n').map(l => '    ' + l).join('\n').trim()}`);
          }
        } else if (block.type === "text" && isVerbose) {
          console.log(`  ${block.text}`);
        }
      }
    }

    // Capture and log tool results
    if (message.type === "user" && message.tool_use_result) {
      toolResults.push(message.tool_use_result);
      if (isVerbose) {
        const resultStr = JSON.stringify(message.tool_use_result, null, 2);
        const preview = resultStr.length > 500 ? resultStr.substring(0, 500) + "..." : resultStr;
        console.log("\n[TOOL RESULT]");
        console.log(`  ${preview.split('\n').map(l => '  ' + l).join('\n').trim()}`);
      }
    }

    // Capture final result
    if (message.type === "result") {
      result = message;
      if (isVerbose && result.subtype === "success") {
        console.log("\n[RESULT]");
        console.log(`  ${result.result}`);
      }
    }
  }

  // Extract token usage from result
  const inputTokens = result?.usage?.input_tokens ?? 0;
  const outputTokens = result?.usage?.output_tokens ?? 0;

  return {
    toolCalls,
    toolResults,
    finalResult: result?.subtype === "success" ? result.result : "",
    success: result?.subtype === "success",
    cost: result?.subtype === "success" ? result.total_cost_usd : 0,
    turns: result?.subtype === "success" ? result.num_turns : 0,
    availableTools: initMessage?.tools ?? [],
    tokens: {
      input: inputTokens,
      output: outputTokens,
      total: inputTokens + outputTokens
    }
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
  console.log(`Tokens: ${result.tokens.total} (in: ${result.tokens.input}, out: ${result.tokens.output})`);
  console.log(`Turns: ${result.turns}`);
  console.log(`Success: ${result.success}`);
}
