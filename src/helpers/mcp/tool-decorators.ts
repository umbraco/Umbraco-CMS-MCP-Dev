import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ZodRawShape, ZodTypeAny } from "zod";
import { AxiosResponse } from "axios";
import { ToolDefinition, ToolAnnotations } from "../../types/tool-definition.js";
import { ProblemDetails } from "@/umb-management-api/schemas/index.js";
import { UmbracoManagementClient } from "@umb-management-client";
import {
  getVersionCheckMessage,
  clearVersionCheckMessage,
  isToolExecutionBlocked
} from "../version-check/check-umbraco-version.js";

/**
 * Creates a properly typed tool result with structured content.
 * 
 * This helper centralizes the type assertion needed because the MCP SDK's ToolCallback
 * type expects structuredContent to be `{ [x: string]: unknown } | undefined`, but at runtime
 * the SDK accepts any type (objects, arrays, primitives, null, etc.) as documented.
 * 
 * By centralizing the assertion here, we:
 * 1. Avoid scattering `as any` throughout the codebase
 * 2. Document why the assertion is necessary
 * 3. Make it easier to update if the SDK types change
 * 4. Preserve the actual return type for better IDE support
 * 5. Only include structuredContent when outputSchema is defined (reduces token usage)
 * 6. Content is optional when structuredContent is provided (further reduces token usage)
 * 
 * @overload
 * When structuredContent is provided, content is optional and defaults to empty array
 * @param structuredContent - The structured data matching the outputSchema
 * @param isError - Optional flag indicating this is an error response
 * @param includeStructured - Whether to include structuredContent (default: true)
 * @param content - Optional content array (defaults to empty when structuredContent provided)
 * 
 * @overload
 * When no structuredContent, content is required for backward compatibility
 * @param structuredContent - undefined
 * @param isError - Optional flag indicating this is an error response
 * @param includeStructured - Whether to include structuredContent (default: false)
 * @param content - Required content array
 * 
 * @returns A tool result that satisfies ToolCallback's type constraints
 */
export function createToolResult<T = unknown>(
  structuredContent?: T,
  isError?: boolean,
  includeStructured: boolean = true,
  content?: Array<{ type: "text"; text: string }>
): {
  content: Array<{ type: "text"; text: string }>;
  structuredContent?: { [x: string]: unknown };
  isError?: boolean;
} {
  // Type assertion is necessary here because ToolCallback's type definition is more
  // restrictive than the actual runtime behavior. The MCP SDK accepts structuredContent
  // of any type at runtime (objects, arrays, primitives, null), but TypeScript only
  // allows objects with index signatures. This is a known limitation of the SDK's types.
  
  // When structuredContent is provided and no content is specified, use empty array
  // to minimize token usage while still satisfying the MCP SDK's content requirement
  // When no structuredContent, content must be provided (for tools without outputSchema)
  const finalContent = content ?? (structuredContent !== undefined && includeStructured ? [] : [{ type: "text" as const, text: "" }]);
  
  return {
    content: finalContent,
    ...(includeStructured && structuredContent !== undefined && { 
      structuredContent: structuredContent as { [x: string]: unknown } 
    }),
    ...(isError && { isError }),
  };
}

/**
 * Creates a tool result for error responses with structured content.
 * Umbraco API errors are ProblemDetails objects, so we use structured output.
 * 
 * @param errorData - The error data (typically ProblemDetails from Umbraco API)
 * @returns A tool result with isError flag set to true
 */
export function createToolResultError<T = unknown>(
  errorData: T
): {
  content: Array<{ type: "text"; text: string }>;
  structuredContent?: { [x: string]: unknown };
  isError: boolean;
} {
  const result = createToolResult(errorData, true);
  return {
    ...result,
    isError: true, // Ensure isError is always true
  };
}

/**
 * Standard options for operations that need to capture full responses
 * and handle all status codes (including 400+ errors).
 */
export const FULL_RESPONSE_OPTIONS = {
  returnFullResponse: true,
  validateStatus: () => true,
} as const;

/**
 * @deprecated Use FULL_RESPONSE_OPTIONS instead
 */
export const VOID_OPERATION_OPTIONS = FULL_RESPONSE_OPTIONS;

/**
 * Handles void operations (PUT, DELETE, POST that return void on success).
 * Checks response status and returns appropriate result:
 * - Success (200-299): Returns success result with no structuredContent
 * - Error (400+, etc.): Returns error result with structured ProblemDetails
 * 
 * This helper eliminates boilerplate for operations that return void on success
 * but need to handle errors (including 400 Bad Request) as structured ProblemDetails.
 * 
 * @param response - The AxiosResponse from the API call
 * @returns Tool result with success or error (including ProblemDetails for 400+ status codes)
 */
export function handleVoidOperation(
  response: AxiosResponse<ProblemDetails | void>
): {
  content: Array<{ type: "text"; text: string }>;
  structuredContent?: { [x: string]: unknown };
  isError?: boolean;
} {
  // Success status codes (200-299)
  if (response.status >= 200 && response.status < 300) {
    return createToolResult(
      undefined,  // No structuredContent for void responses
      false,      // isError
      false       // includeStructured - No outputSchema, so exclude structuredContent to reduce token usage
    );
  }
  
  // Error status codes (400+, 500+, etc.) - all returned as structured ProblemDetails
  const errorData: ProblemDetails = response.data || {
    status: response.status,
    detail: response.statusText,
  };
  return createToolResultError(errorData);
}

/**
 * Executes a void operation (PUT, DELETE, POST that return void on success)
 * and handles the response automatically.
 * 
 * This helper:
 * 1. Gets the client (singleton, so efficient - no need to worry about instantiation)
 * 2. Calls the API method with standard options for error handling
 * 3. Handles the response and returns appropriate tool result
 * 
 * The type casting is handled internally to avoid polluting call sites.
 * 
 * @param apiCall - A function that takes the client and returns the API call promise
 * @returns Tool result with success or error (including ProblemDetails for 400+ status codes)
 * 
 * @example
 * return executeVoidOperation((client) => 
 *   client.deleteDataTypeById(id, FULL_RESPONSE_OPTIONS)
 * );
 */
export async function executeVoidOperation(
  apiCall: (client: ReturnType<typeof UmbracoManagementClient.getClient>) => Promise<any>
): Promise<{
  content: Array<{ type: "text"; text: string }>;
  structuredContent?: { [x: string]: unknown };
  isError?: boolean;
}> {
  const client = UmbracoManagementClient.getClient();
  const result = await apiCall(client);
  
  // When VOID_OPERATION_OPTIONS is passed, the API returns AxiosResponse
  // TypeScript can't infer this, so we handle it at runtime
  const response = result as AxiosResponse<ProblemDetails | void>;
  
  // If result is undefined/null (shouldn't happen with VOID_OPERATION_OPTIONS), assume success
  if (!response || typeof response !== 'object' || !('status' in response)) {
    return createToolResult(undefined, false, false);
  }
  
  return handleVoidOperation(response);
}

/**
 * Executes a GET operation and handles the response automatically.
 * 
 * This helper:
 * 1. Gets the client (singleton, so efficient)
 * 2. Calls the API method with standard options for error handling
 * 3. Handles the response and returns appropriate tool result
 * 4. Returns structured data on success, structured ProblemDetails on error
 * 
 * The type casting is handled internally to avoid polluting call sites.
 * 
 * @param apiCall - A function that takes the client and returns the API call promise
 * @returns Tool result with success data or error (including ProblemDetails for 400+ status codes)
 * 
 * @example
 * return executeGetOperation((client) => 
 *   client.getDataTypeById(id, FULL_RESPONSE_OPTIONS)
 * );
 */
export async function executeGetOperation<T = unknown>(
  apiCall: (client: ReturnType<typeof UmbracoManagementClient.getClient>) => Promise<any>
): Promise<{
  content: Array<{ type: "text"; text: string }>;
  structuredContent?: { [x: string]: unknown };
  isError?: boolean;
}> {
  const client = UmbracoManagementClient.getClient();
  const result = await apiCall(client);
  
  // When FULL_RESPONSE_OPTIONS is passed, the API returns AxiosResponse
  // TypeScript can't infer this, so we handle it at runtime
  const response = result as AxiosResponse<T | ProblemDetails>;
  
  // If result is undefined/null (shouldn't happen with FULL_RESPONSE_OPTIONS), assume success
  if (!response || typeof response !== 'object' || !('status' in response)) {
    // Fallback: assume result is the data directly (legacy behavior without options)
    return createToolResult(result as T);
  }
  
  // Check for error status codes (400+, 500+, etc.)
  if (response.status >= 200 && response.status < 300) {
    // Success - return structured data
    return createToolResult(response.data as T);
  } else {
    // Error - return structured ProblemDetails
    const errorData: ProblemDetails = response.data || {
      status: response.status,
      detail: response.statusText,
    };
    return createToolResultError(errorData);
  }
}

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
