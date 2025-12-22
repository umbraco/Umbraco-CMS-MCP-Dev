import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import { ServerRequest, ServerNotification, CallToolResult } from "@modelcontextprotocol/sdk/types.js";

/**
 * Creates a mock RequestHandlerExtra object for testing tool handlers.
 * This provides all required properties expected by the MCP SDK v1.25+.
 *
 * @returns A mock RequestHandlerExtra object suitable for testing
 */
export function createMockRequestHandlerExtra(): RequestHandlerExtra<ServerRequest, ServerNotification> {
  return {
    signal: new AbortController().signal,
    requestId: "test-request-id",
    sendNotification: async () => {},
    sendRequest: async () => ({}) as any,
  };
}

/**
 * Helper to create tool handler params for testing.
 * Zod 4's ShapeOutput requires all properties to be present (even optional ones).
 * This helper allows passing partial params while satisfying the type system.
 *
 * @param params - Partial parameters for the tool handler
 * @returns The same params cast to any to bypass strict typing
 */
export function createToolParams<T>(params: T): any {
  return params;
}

/**
 * Extracts text from a tool result's first content item.
 * SDK v1.25+ uses discriminated unions for content types, requiring type narrowing.
 *
 * @param result - The CallToolResult from a tool handler
 * @returns The text content as a string, or empty string if not text type
 */
export function getResultText(result: CallToolResult): string {
  const content = result.content[0];
  if (content && content.type === "text") {
    return content.text;
  }
  return "";
}
