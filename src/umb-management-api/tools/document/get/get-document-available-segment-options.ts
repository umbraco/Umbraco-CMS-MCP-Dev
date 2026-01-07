import { getDocumentByIdAvailableSegmentOptionsParams, getDocumentByIdAvailableSegmentOptionsQueryParams, getDocumentByIdAvailableSegmentOptionsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const inputSchema = z.object({
  ...getDocumentByIdAvailableSegmentOptionsParams.shape,
  ...getDocumentByIdAvailableSegmentOptionsQueryParams.shape,
});

const GetDocumentAvailableSegmentOptionsTool = {
  name: "get-document-available-segment-options",
  description: `Gets available segment options for a document by its id

  Use this to retrieve the available segment options (content variations) for a document.

  Useful for:
  • Understanding what content variations are available for a document
  • Determining which segments can be used when creating or editing document content
  • Viewing segment names, aliases, and associated cultures`,
  inputSchema: inputSchema.shape,
  outputSchema: getDocumentByIdAvailableSegmentOptionsResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['read'],
  handler: (async ({ id, skip, take }: z.infer<typeof inputSchema>) => {
    return executeGetApiCall((client) =>
      client.getDocumentByIdAvailableSegmentOptions(id, { skip, take }, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema.shape, typeof getDocumentByIdAvailableSegmentOptionsResponse.shape>;

export default withStandardDecorators(GetDocumentAvailableSegmentOptionsTool);
