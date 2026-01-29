import { getTreeStaticFileAncestorsQueryParams, getTreeStaticFileAncestorsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetTreeStaticFileAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

// Wrap array response in object for MCP compliance
const outputSchema = z.object({
  items: getTreeStaticFileAncestorsResponse,
});

const GetStaticFileAncestorsTool = {
  name: "get-static-file-ancestors",
  description: "Gets ancestor folders for navigation breadcrumbs by descendant path",
  inputSchema: getTreeStaticFileAncestorsQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeStaticFileAncestorsParams) => {
    return executeGetItemsApiCall((client) =>
      client.getTreeStaticFileAncestors(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeStaticFileAncestorsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetStaticFileAncestorsTool);
