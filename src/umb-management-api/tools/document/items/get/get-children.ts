import { getTreeDocumentChildrenQueryParams, getTreeDocumentChildrenResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

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
