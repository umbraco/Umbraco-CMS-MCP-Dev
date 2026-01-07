import { GetTreeTemplateAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeTemplateAncestorsQueryParams, getTreeTemplateAncestorsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";
import { executeGetItemsApiCall } from "@/helpers/mcp/index.js";

// Wrap array response in object for MCP compliance
const outputSchema = z.object({
  items: getTreeTemplateAncestorsResponse,
});

const GetTemplateAncestorsTool = {
  name: "get-template-ancestors",
  description: "Gets the ancestors of a template by Id",
  inputSchema: getTreeTemplateAncestorsQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeTemplateAncestorsParams) => {
    return executeGetItemsApiCall((client) =>
      client.getTreeTemplateAncestors(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeTemplateAncestorsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetTemplateAncestorsTool);
