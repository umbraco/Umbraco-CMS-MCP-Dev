import { GetTreeDocumentBlueprintRootParams } from "@/umb-management-api/schemas/index.js";
import { getTreeDocumentBlueprintRootQueryParams, getTreeDocumentBlueprintRootResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";

const outputSchema = z.object({
  items: getTreeDocumentBlueprintRootResponse.shape.items,
  total: getTreeDocumentBlueprintRootResponse.shape.total,
});

const GetDocumentBlueprintRootTool = {
  name: "get-document-blueprint-root",
  description: "Gets the root level of the document blueprint tree",
  inputSchema: getTreeDocumentBlueprintRootQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeDocumentBlueprintRootParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeDocumentBlueprintRoot(params);
    return createToolResult(response);
  }),
} satisfies ToolDefinition<typeof getTreeDocumentBlueprintRootQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDocumentBlueprintRootTool);
