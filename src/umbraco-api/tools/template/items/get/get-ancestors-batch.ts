import { GetItemTemplateAncestorsParams } from "@/umbraco-api/schemas/index.js";
import { getItemTemplateAncestorsQueryParams, getItemTemplateAncestorsResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const outputSchema = z.object({
  items: getItemTemplateAncestorsResponse,
});

const GetTemplateAncestorsBatchTool = {
  name: "get-template-ancestors-batch",
  description: `Gets the ancestor chain (breadcrumb) for multiple template Ids in one call.
  Returns one entry per requested Id, each containing that Id's chain of ancestors.
  Differs from get-template-ancestors which returns the tree-style ancestors of a single Id.`,
  inputSchema: getItemTemplateAncestorsQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['list'],
  handler: (async (params: GetItemTemplateAncestorsParams) => {
    return executeGetItemsApiCall((client) =>
      client.getItemTemplateAncestors(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemTemplateAncestorsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetTemplateAncestorsBatchTool);
