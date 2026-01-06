import { GetItemScriptParams } from "@/umb-management-api/schemas/index.js";
import { getItemScriptQueryParams, getItemScriptResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";
import { executeGetItemsApiCall } from "@/helpers/mcp/index.js";

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
    return executeGetItemsApiCall((client) =>
      client.getItemScript(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemScriptQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetScriptItemsTool);
