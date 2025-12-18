import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ZodRawShape } from "zod";
import { ToolDefinition } from "../../types/tool-definition.js";
import {
  getVersionCheckMessage,
  clearVersionCheckMessage,
  isToolExecutionBlocked
} from "../version-check/check-umbraco-version.js";

/**
 * Wraps a tool handler with standardized error handling.
 * Catches errors and returns them in a consistent format.
 */
export function withErrorHandling<Args extends undefined | ZodRawShape>(
  tool: ToolDefinition<Args>
): ToolDefinition<Args> {
  const originalHandler = tool.handler;

  return {
    ...tool,
    handler: (async (args: any, context: any) => {
      try {
        return await originalHandler(args, context);
      } catch (error) {
        console.error(`Error in tool ${tool.name}:`, error);

        const errorDetails = error instanceof Error
          ? { message: error.message, cause: error.cause, response: (error as any).response?.data }
          : error;

        return {
          content: [{
            type: "text" as const,
            text: `Error using ${tool.name}:\n${JSON.stringify(errorDetails, null, 2)}`,
          }]
        };
      }
    }) as ToolCallback<Args>,
  };
}

/**
 * Wraps a tool handler with version check blocking.
 * Blocks execution if there's a version incompatibility warning.
 */
export function withVersionCheck<Args extends undefined | ZodRawShape>(
  tool: ToolDefinition<Args>
): ToolDefinition<Args> {
  const originalHandler = tool.handler;

  return {
    ...tool,
    handler: (async (args: any, context: any) => {
      // If blocked, show warning and clear for next attempt
      if (isToolExecutionBlocked()) {
        const versionMessage = getVersionCheckMessage();
        clearVersionCheckMessage(); // Clears both message and blocking state
        return {
          content: [{
            type: "text" as const,
            text: `${versionMessage}\n\n⚠️ Tool execution paused due to version incompatibility.\n\nIf you understand the risks and want to proceed anyway, please retry your request.`,
          }],
          isError: true,
        };
      }

      return await originalHandler(args, context);
    }) as ToolCallback<Args>,
  };
}

/**
 * Composes multiple decorator functions together.
 * Decorators are applied from right to left (last decorator applied first).
 *
 * @example
 * compose(withErrorHandling, withVersionCheck)(myTool)
 * // Equivalent to: withErrorHandling(withVersionCheck(myTool))
 */
export function compose<Args extends undefined | ZodRawShape>(
  ...decorators: Array<(tool: ToolDefinition<Args>) => ToolDefinition<Args>>
): (tool: ToolDefinition<Args>) => ToolDefinition<Args> {
  return (tool: ToolDefinition<Args>) =>
    decorators.reduceRight((decorated, decorator) => decorator(decorated), tool);
}

/**
 * Standard decorator composition for all tools.
 * Applies: withVersionCheck -> withErrorHandling
 *
 * @example
 * export default withStandardDecorators(myTool);
 */
export function withStandardDecorators<Args extends undefined | ZodRawShape>(
  tool: ToolDefinition<Args>
): ToolDefinition<Args> {
  return compose(withErrorHandling, withVersionCheck)(tool);
}
