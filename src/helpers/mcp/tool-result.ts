/**
 * Tool Result Helpers
 *
 * This module provides helpers for creating standardized MCP tool results
 * with proper typing for structured content.
 */

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
