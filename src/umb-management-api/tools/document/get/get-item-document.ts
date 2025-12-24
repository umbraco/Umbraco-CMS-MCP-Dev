import { getItemDocumentQueryParams, getItemDocumentResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";

const outputSchema = z.object({
  items: getItemDocumentResponse,
});

const GetItemDocumentTool = {
  name: "get-item-document",
  description: "Gets document items by their ids",
  inputSchema: getItemDocumentQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['list'],
  handler: (async (params: z.infer<typeof getItemDocumentQueryParams>) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemDocument(params);
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<typeof getItemDocumentQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetItemDocumentTool);
