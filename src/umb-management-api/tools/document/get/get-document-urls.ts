import { getDocumentUrlsQueryParams, getDocumentUrlsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";

const outputSchema = z.object({
  items: getDocumentUrlsResponse,
});

const GetDocumentUrlsTool = {
  name: "get-document-urls",
  description: "Gets the URLs for a document.",
  inputSchema: getDocumentUrlsQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['urls'],
  handler: (async (params: z.infer<typeof getDocumentUrlsQueryParams>) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentUrls(params);
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<typeof getDocumentUrlsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDocumentUrlsTool);
