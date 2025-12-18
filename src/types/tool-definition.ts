import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ZodRawShape } from "zod";

// Re-export ToolSliceName from the single source of truth
export type { ToolSliceName, ExtendedSliceName } from "@/helpers/config/slice-registry.js";
import type { ToolSliceName } from "@/helpers/config/slice-registry.js";

export interface ToolDefinition<
  Args extends undefined | ZodRawShape = undefined
> {
  name: string;
  description: string;
  schema: Args;
  handler: ToolCallback<Args>;
  enabled?: (user: CurrentUserResponseModel) => boolean;
  isReadOnly: boolean;
  slices: ToolSliceName[];  // Explicit slice assignment (empty array = always included)
}


