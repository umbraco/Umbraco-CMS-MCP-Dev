import { GetTreeDocumentBlueprintAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeDocumentBlueprintAncestorsQueryParams, getTreeDocumentBlueprintAncestorsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";

const outputSchema = z.object({
  items: getTreeDocumentBlueprintAncestorsResponse,
});

const GetDocumentBlueprintAncestorsTool = {
  name: "get-document-blueprint-ancestors",
  description: "Gets the ancestors of a document blueprint by Id",
  inputSchema: getTreeDocumentBlueprintAncestorsQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeDocumentBlueprintAncestorsParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeDocumentBlueprintAncestors(params);
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<typeof getTreeDocumentBlueprintAncestorsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDocumentBlueprintAncestorsTool);
