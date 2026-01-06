import { getDocumentUrlsQueryParams, getDocumentUrlsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";
import { executeGetItemsApiCall } from "@/helpers/mcp/index.js";

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
