import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ZodRawShape, ZodTypeAny } from "zod";

// Re-export ToolSliceName from the single source of truth
export type { ToolSliceName, ExtendedSliceName } from "@/helpers/config/slice-registry.js";
import type { ToolSliceName } from "@/helpers/config/slice-registry.js";

/**
 * MCP tool annotations provide metadata about tool behavior.
 * These are advisory hints that help clients understand tool characteristics.
 */
export interface ToolAnnotations {
  /** Human-readable title for the tool (optional, defaults to name) */
  title?: string;
  /** Indicates if the tool does not modify its environment (defaults to false if not specified) */
  readOnlyHint?: boolean;
  /** Suggests whether the tool may perform destructive updates */
  destructiveHint?: boolean;
  /** Shows if calling the tool multiple times with the same arguments has the same effect */
  idempotentHint?: boolean;
  /** Specifies if the tool interacts with external systems (always true for API-based tools) */
  openWorldHint: boolean;
}

export interface ToolDefinition<
  InputArgs extends undefined | ZodRawShape = undefined,
  OutputArgs extends undefined | ZodRawShape | ZodTypeAny = undefined
> {
  name: string;
  description: string;
  inputSchema: InputArgs;
  outputSchema?: OutputArgs;  // Optional output schema for structured responses (supports objects, arrays, primitives)
  handler: ToolCallback<InputArgs>;
  enabled?: (user: CurrentUserResponseModel) => boolean;
  slices: ToolSliceName[];  // Explicit slice assignment (empty array = always included)
  annotations?: Partial<ToolAnnotations>;  // Optional annotations (readOnlyHint and openWorldHint are required and auto-populated)
}


