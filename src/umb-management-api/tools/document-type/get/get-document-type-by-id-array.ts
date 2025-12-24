import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { getItemDocumentTypeQueryParams, getItemDocumentTypeResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetItemDocumentTypeParams } from "@/umb-management-api/schemas/index.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";

const outputSchema = z.object({
  items: getItemDocumentTypeResponse,
});

const GetDocumentTypesByIdArrayTool = {
  name: "get-document-types-by-id-array",
  description: "Gets document types by IDs (or empty array if no IDs are provided)",
  inputSchema: getItemDocumentTypeQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['list'],
  handler: (async (params: GetItemDocumentTypeParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemDocumentType(params);
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<typeof getItemDocumentTypeQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDocumentTypesByIdArrayTool);
