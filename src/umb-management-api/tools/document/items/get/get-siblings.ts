import { getTreeDocumentSiblingsQueryParams, getTreeDocumentSiblingsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

const GetDocumentSiblingsTool = {
  name: "get-document-siblings",
  description: "Gets sibling documents for a given descendant id",
  inputSchema: getTreeDocumentSiblingsQueryParams.shape,
  outputSchema: getTreeDocumentSiblingsResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['tree'],
  handler: (async (params: z.infer<typeof getTreeDocumentSiblingsQueryParams>) => {
    return executeGetApiCall((client) =>
      client.getTreeDocumentSiblings(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeDocumentSiblingsQueryParams.shape, typeof getTreeDocumentSiblingsResponse.shape>;

export default withStandardDecorators(GetDocumentSiblingsTool);
