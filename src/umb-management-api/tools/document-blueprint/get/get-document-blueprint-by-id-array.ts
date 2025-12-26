import { GetItemDocumentBlueprintParams } from "@/umb-management-api/schemas/index.js";
import { getItemDocumentBlueprintQueryParams, getItemDocumentBlueprintResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";

const outputSchema = z.object({
  items: getItemDocumentBlueprintResponse,
});

const GetDocumentBlueprintByIdArrayTool = {
  name: "get-document-blueprint-by-id-array",
  description: "Gets document blueprints by IDs (or empty array if no IDs are provided)",
  inputSchema: getItemDocumentBlueprintQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['list'],
  handler: (async (params: GetItemDocumentBlueprintParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemDocumentBlueprint(params);
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<typeof getItemDocumentBlueprintQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDocumentBlueprintByIdArrayTool);
