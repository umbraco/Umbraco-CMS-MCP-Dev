import {
  executeVoidApiCall,
  type HttpResponse,
  type ProblemDetails,
} from "@umbraco-cms/mcp-server-sdk";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// Shared empty output schema for void mutation tools. Pairs with executeVoidApiCallWithEmptyOutput
// so the tool registry exposes `output: {}` instead of `unknown`, while the runtime still satisfies
// MCP SDK output validation by emitting structuredContent: {}.
export const emptyOutputSchema = z.object({});
export const emptyOutputShape = emptyOutputSchema.shape;
export type EmptyOutputShape = typeof emptyOutputShape;

// Like executeVoidApiCall but ensures structuredContent: {} is set on success,
// so tools that declare outputSchema: emptyOutputShape pass MCP SDK output validation.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function executeVoidApiCallWithEmptyOutput<TClient = any>(
  apiCall: (client: TClient) => Promise<HttpResponse<ProblemDetails | void> | unknown>
): Promise<CallToolResult> {
  const result = await executeVoidApiCall(apiCall);
  return result.isError ? result : { ...result, structuredContent: {} };
}
