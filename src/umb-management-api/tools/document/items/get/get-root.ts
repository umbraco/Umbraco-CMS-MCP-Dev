import { getTreeDocumentRootQueryParams, getTreeDocumentRootResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

const GetDocumentRootTool = {
  name: "get-document-root",
  description: "Gets root items for documents.",
  inputSchema: getTreeDocumentRootQueryParams.shape,
  outputSchema: getTreeDocumentRootResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['tree'],
  handler: (async (params: z.infer<typeof getTreeDocumentRootQueryParams>) => {
    return executeGetApiCall((client) =>
      client.getTreeDocumentRoot(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeDocumentRootQueryParams.shape, typeof getTreeDocumentRootResponse.shape>;

export default withStandardDecorators(GetDocumentRootTool);
