/**
 * Tool Decorators
 *
 * This module provides decorator functions for wrapping MCP tool handlers
 * with cross-cutting concerns like error handling and version checking.
 */

import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ZodRawShape, ZodTypeAny } from "zod";
import { ToolDefinition, ToolAnnotations } from "../../types/tool-definition.js";
import {
  getVersionCheckMessage,
  clearVersionCheckMessage,
  isToolExecutionBlocked
} from "../version-check/check-umbraco-version.js";
import { createToolResultError } from "./tool-result.js";

// Re-export everything from split modules for backwards compatibility
export {
  createToolResult,
  createToolResultError,
} from "./tool-result.js";

export {
  CAPTURE_RAW_HTTP_RESPONSE,
  FULL_RESPONSE_OPTIONS,
  processVoidResponse,
  executeVoidApiCall,
  executeVoidOperation,
  executeGetApiCall,
  executeGetOperation,
  handleVoidOperation,
  executeVoidApiCallWithOptions,
  type VoidApiCallOptions,
} from "./api-call-helpers.js";

/**
 * Wraps a tool handler with standardized error handling.
 * Catches errors and returns them in a consistent format.
 */
export function withErrorHandling<Args extends undefined | ZodRawShape, OutputArgs extends undefined | ZodRawShape | ZodTypeAny = undefined>(
  tool: ToolDefinition<Args, OutputArgs>
): ToolDefinition<Args, OutputArgs> {
  const originalHandler = tool.handler;

  return {
    ...tool,
    handler: (async (args: any, context: any) => {
      try {
        return await originalHandler(args, context);
      } catch (error) {
        console.error(`Error in tool ${tool.name}:`, error);

        // Umbraco API errors are ProblemDetails objects (structured data)
        // Extract the ProblemDetails from the error response if available
        const errorData = error instanceof Error && (error as any).response?.data
          ? (error as any).response.data
          : error instanceof Error
          ? { message: error.message, cause: error.cause }
          : error;

        return createToolResultError(errorData);
      }
    }) as ToolCallback<Args>,
  };
}

/**
 * Wraps a tool handler with version check blocking.
 * Blocks execution if there's a version incompatibility warning.
 */
export function withVersionCheck<Args extends undefined | ZodRawShape, OutputArgs extends undefined | ZodRawShape | ZodTypeAny = undefined>(
  tool: ToolDefinition<Args, OutputArgs>
): ToolDefinition<Args, OutputArgs> {
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
export function compose<Args extends undefined | ZodRawShape, OutputArgs extends undefined | ZodRawShape | ZodTypeAny = undefined>(
  ...decorators: Array<(tool: ToolDefinition<Args, OutputArgs>) => ToolDefinition<Args, OutputArgs>>
): (tool: ToolDefinition<Args, OutputArgs>) => ToolDefinition<Args, OutputArgs> {
  return (tool: ToolDefinition<Args, OutputArgs>) =>
    decorators.reduceRight((decorated, decorator) => decorator(decorated), tool);
}

/**
 * Creates annotations for a tool, ensuring openWorldHint is always true.
 * Tools should explicitly define their annotations with only true values (readOnlyHint, destructiveHint, idempotentHint).
 * This function ensures openWorldHint is set to true and provides defaults for missing values.
 *
 * @param tool - The tool definition
 * @returns Complete annotations object with defaults applied
 */
export function createToolAnnotations(tool: ToolDefinition<any, any>): ToolAnnotations {
  // Tool annotations only contain explicit true values
  const toolAnnotations = tool.annotations || {};

  return {
    readOnlyHint: toolAnnotations.readOnlyHint ?? false,  // Default to false if not specified
    destructiveHint: toolAnnotations.destructiveHint ?? false,  // Default to false if not specified
    idempotentHint: toolAnnotations.idempotentHint ?? false,  // Default to false if not specified
    openWorldHint: true,  // Always true - all tools interact with external Umbraco API
    ...(toolAnnotations.title && { title: toolAnnotations.title }),  // Include title if provided
  };
}

/**
 * Standard decorator composition for all tools.
 * Applies: withVersionCheck -> withErrorHandling
 *
 * @example
 * export default withStandardDecorators(myTool);
 */
export function withStandardDecorators<Args extends undefined | ZodRawShape, OutputArgs extends undefined | ZodRawShape | ZodTypeAny = undefined>(
  tool: ToolDefinition<Args, OutputArgs>
): ToolDefinition<Args, OutputArgs> {
  return compose<Args, OutputArgs>(withErrorHandling, withVersionCheck)(tool);
}
