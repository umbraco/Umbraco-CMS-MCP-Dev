import { getTreeDocumentSiblingsQueryParams, getTreeDocumentSiblingsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

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
