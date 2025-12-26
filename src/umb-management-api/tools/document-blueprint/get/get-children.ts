import { GetTreeDocumentBlueprintChildrenParams } from "@/umb-management-api/schemas/index.js";
import { getTreeDocumentBlueprintChildrenQueryParams, getTreeDocumentBlueprintChildrenResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";

const outputSchema = z.object({
  items: getTreeDocumentBlueprintChildrenResponse.shape.items,
  total: getTreeDocumentBlueprintChildrenResponse.shape.total,
});

const GetDocumentBlueprintChildrenTool = {
  name: "get-document-blueprint-children",
  description: "Gets the children of a document blueprint by Id",
  inputSchema: getTreeDocumentBlueprintChildrenQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeDocumentBlueprintChildrenParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeDocumentBlueprintChildren(params);
    return createToolResult(response);
  }),
} satisfies ToolDefinition<typeof getTreeDocumentBlueprintChildrenQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDocumentBlueprintChildrenTool);
