import { getTreeDocumentChildrenQueryParams, getTreeDocumentChildrenResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

const GetDocumentChildrenTool = {
  name: "get-document-children",
  description: "Gets child items for a document.",
  inputSchema: getTreeDocumentChildrenQueryParams.shape,
  outputSchema: getTreeDocumentChildrenResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['tree'],
  handler: (async (params: z.infer<typeof getTreeDocumentChildrenQueryParams>) => {
    return executeGetApiCall((client) =>
      client.getTreeDocumentChildren(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeDocumentChildrenQueryParams.shape, typeof getTreeDocumentChildrenResponse.shape>;

export default withStandardDecorators(GetDocumentChildrenTool);
