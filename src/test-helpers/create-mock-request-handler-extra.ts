import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import { ServerRequest, ServerNotification, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z, ZodType } from "zod";

/**
 * Zod schema for RFC 7807 Problem Details.
 * Matches the Umbraco API error response format.
 */
export const problemDetailsSchema = z.object({
  type: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  status: z.number().nullable().optional(),
  detail: z.string().nullable().optional(),
  instance: z.string().nullable().optional(),
}).passthrough(); // Allow additional properties per RFC 7807

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
 * Extracts text from a tool result's first content item.
 * SDK v1.25+ uses discriminated unions for content types, requiring type narrowing.
 *
 * @param result - The CallToolResult from a tool handler
 * @returns The text content as a string, or empty string if not text type
 * @deprecated Use getStructuredContent instead - tools now return structuredContent
 */
export function getResultText(result: CallToolResult): string {
  const content = result.content[0];
  if (content && content.type === "text") {
    return content.text;
  }
  return "";
}

/**
 * Extracts structured content from a tool result.
 * Tools with outputSchema return structured data in structuredContent.
 *
 * @param result - The CallToolResult from a tool handler
 * @returns The structured content, or undefined if not present
 */
export function getStructuredContent(result: CallToolResult): unknown {
  return result.structuredContent;
}

/**
 * Validates structured content against a Zod schema.
 * Throws if validation fails, returns parsed data if successful.
 * This ensures that Umbraco API responses match the expected schema structure.
 *
 * @param result - The CallToolResult from a tool handler
 * @param schema - The Zod schema to validate against
 * @returns The validated and parsed data
 */
export function validateStructuredContent<T>(
  result: CallToolResult,
  schema: ZodType<T>
): T {
  return schema.parse(result.structuredContent);
}

/**
 * Validates an error response against the ProblemDetails schema.
 * Asserts isError is true and structuredContent matches RFC 7807 format.
 *
 * @param result - The CallToolResult from a tool handler
 * @returns The validated ProblemDetails data
 */
export function validateErrorResult(result: CallToolResult): z.infer<typeof problemDetailsSchema> {
  if (!result.isError) {
    throw new Error("Expected result.isError to be true");
  }
  return problemDetailsSchema.parse(result.structuredContent);
}
