import { getTreeStaticFileAncestorsQueryParams, getTreeStaticFileAncestorsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetTreeStaticFileAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";

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
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeStaticFileAncestors(params);
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<typeof getTreeStaticFileAncestorsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetStaticFileAncestorsTool);
