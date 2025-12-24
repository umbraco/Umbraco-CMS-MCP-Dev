import { GetTreeDocumentTypeAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeDocumentTypeAncestorsQueryParams, getTreeDocumentTypeAncestorsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";

const outputSchema = z.object({
  items: getTreeDocumentTypeAncestorsResponse,
});

const GetDocumentTypeAncestorsTool = {
  name: "get-document-type-ancestors",
  description: "Gets the ancestors of a document type",
  inputSchema: getTreeDocumentTypeAncestorsQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeDocumentTypeAncestorsParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeDocumentTypeAncestors(params);
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<typeof getTreeDocumentTypeAncestorsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDocumentTypeAncestorsTool);
