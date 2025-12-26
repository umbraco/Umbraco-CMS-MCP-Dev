import { GetTreeDocumentBlueprintSiblingsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeDocumentBlueprintSiblingsQueryParams, getTreeDocumentBlueprintSiblingsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";

const outputSchema = z.object({
  items: getTreeDocumentBlueprintSiblingsResponse.shape.items,
  totalBefore: getTreeDocumentBlueprintSiblingsResponse.shape.totalBefore,
  totalAfter: getTreeDocumentBlueprintSiblingsResponse.shape.totalAfter,
});

const GetDocumentBlueprintSiblingsTool = {
  name: "get-document-blueprint-siblings",
  description: "Gets sibling document blueprints for a given descendant id",
  inputSchema: getTreeDocumentBlueprintSiblingsQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeDocumentBlueprintSiblingsParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeDocumentBlueprintSiblings(params);
    return createToolResult(response);
  }),
} satisfies ToolDefinition<typeof getTreeDocumentBlueprintSiblingsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDocumentBlueprintSiblingsTool);
