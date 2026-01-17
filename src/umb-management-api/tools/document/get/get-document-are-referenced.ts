import { getDocumentAreReferencedQueryParams, getDocumentAreReferencedResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetDocumentAreReferencedTool = {
  name: "get-document-are-referenced",
  description: `Check if document items are referenced
  Use this to verify if specific document items are being referenced by other content before deletion or modification.`,
  inputSchema: getDocumentAreReferencedQueryParams.shape,
  outputSchema: getDocumentAreReferencedResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['references'],
  handler: (async ({ id, skip, take }: z.infer<typeof getDocumentAreReferencedQueryParams>) => {
    return executeGetApiCall((client) =>
      client.getDocumentAreReferenced({ id, skip, take }, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getDocumentAreReferencedQueryParams.shape, typeof getDocumentAreReferencedResponse.shape>;

export default withStandardDecorators(GetDocumentAreReferencedTool);