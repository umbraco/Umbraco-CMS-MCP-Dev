import { GetItemScriptParams } from "@/umb-management-api/schemas/index.js";
import { getItemScriptQueryParams, getItemScriptResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";

// Wrap array response in object for MCP compliance
const outputSchema = z.object({
  items: getItemScriptResponse,
});

const GetScriptItemsTool = {
  name: "get-script-items",
  description: "Gets script items",
  inputSchema: getItemScriptQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['list'],
  handler: (async (model: GetItemScriptParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemScript(model);
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<typeof getItemScriptQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetScriptItemsTool);
