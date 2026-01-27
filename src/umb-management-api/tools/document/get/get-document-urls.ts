import { getDocumentUrlsQueryParams, getDocumentUrlsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

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
    return executeGetItemsApiCall((client) =>
      client.getDocumentUrls(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getDocumentUrlsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDocumentUrlsTool);
