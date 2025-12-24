import { getTreeDocumentAncestorsQueryParams, getTreeDocumentAncestorsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";

const outputSchema = z.object({
  items: getTreeDocumentAncestorsResponse,
});

const GetDocumentAncestorsTool = {
  name: "get-document-ancestors",
  description: "Gets ancestor items for a document.",
  inputSchema: getTreeDocumentAncestorsQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['tree'],
  handler: (async (params: z.infer<typeof getTreeDocumentAncestorsQueryParams>) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeDocumentAncestors(params);
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<typeof getTreeDocumentAncestorsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDocumentAncestorsTool);
