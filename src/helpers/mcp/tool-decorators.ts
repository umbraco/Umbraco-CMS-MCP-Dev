/**
 * Tool Decorators
 *
 * This module provides decorator functions for wrapping MCP tool handlers
 * with cross-cutting concerns like error handling and version checking.
 */

import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ZodRawShape, ZodType } from "zod";
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
  processVoidResponse,
  executeVoidApiCall,
  executeGetApiCall,
  executeVoidApiCallWithOptions,
  UmbracoApiError,
  type ApiCallOptions,
  type VoidApiCallOptions,
  type UmbracoClient,
  type ApiCallFn,
} from "./api-call-helpers.js";

import { UmbracoApiError } from "./api-call-helpers.js";

/**
 * Wraps a tool handler with standardized error handling.
 * Catches all errors and converts them to MCP tool error results.
 *
 * Error handling priority:
 * 1. UmbracoApiError - API errors with ProblemDetails (from helpers)
 * 2. Axios errors - Network/HTTP errors with response data
 * 3. Standard errors - JavaScript errors with message
 * 4. Unknown errors - Anything else
 */
export function withErrorHandling<Args extends undefined | ZodRawShape, OutputArgs extends undefined | ZodRawShape | ZodType = undefined>(
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

        // UmbracoApiError - thrown by helpers with ProblemDetails
        if (error instanceof UmbracoApiError) {
          return createToolResultError(error.problemDetails);
        }

        // Axios error with response data (network succeeded but got error response)
        if (error instanceof Error && (error as any).response?.data) {
          return createToolResultError((error as any).response.data);
        }

        // Standard Error
        if (error instanceof Error) {
          return createToolResultError({
            message: error.message,
            name: error.name
          });
        }

        // Unknown error type
        return createToolResultError({ message: String(error) });
      }
    }) as ToolCallback<Args>,
  };
}

/**
 * Wraps a tool handler with version check blocking.
 * Blocks execution if there's a version incompatibility warning.
 */
export function withVersionCheck<Args extends undefined | ZodRawShape, OutputArgs extends undefined | ZodRawShape | ZodType = undefined>(
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
export function compose<Args extends undefined | ZodRawShape, OutputArgs extends undefined | ZodRawShape | ZodType = undefined>(
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
export function withStandardDecorators<Args extends undefined | ZodRawShape, OutputArgs extends undefined | ZodRawShape | ZodType = undefined>(
  tool: ToolDefinition<Args, OutputArgs>
): ToolDefinition<Args, OutputArgs> {
  return compose<Args, OutputArgs>(withErrorHandling, withVersionCheck)(tool);
}
