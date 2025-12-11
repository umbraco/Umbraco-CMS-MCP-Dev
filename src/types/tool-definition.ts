import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ZodRawShape } from "zod";

export interface ToolDefinition<
  Args extends undefined | ZodRawShape = undefined
> {
  name: string;
  description: string;
  schema: Args;
  handler: ToolCallback<Args>;
  enabled?: (user: CurrentUserResponseModel) => boolean;
  isReadOnly: boolean;
}


