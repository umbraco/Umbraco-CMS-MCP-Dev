import { getDocumentByIdReferencedDescendantsParams, getDocumentByIdReferencedDescendantsQueryParams, getDocumentByIdReferencedDescendantsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const inputSchema = z.object({
  ...getDocumentByIdReferencedDescendantsParams.shape,
  ...getDocumentByIdReferencedDescendantsQueryParams.shape,
});

const GetDocumentByIdReferencedDescendantsTool = {
  name: "get-document-by-id-referenced-descendants",
  description: `Get descendant references for a document item
  Use this to find all descendant references (child items) that are being referenced for a specific document item.

  Useful for:
  • Impact analysis: Before deleting a document folder, see what content would be affected
  • Dependency tracking: Find all content using documents from a specific folder hierarchy
  • Content auditing: Identify which descendant document items are actually being used`,
  inputSchema: inputSchema.shape,
  outputSchema: getDocumentByIdReferencedDescendantsResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['references'],
  handler: (async ({ id, skip, take }: z.infer<typeof inputSchema>) => {
    return executeGetApiCall((client) =>
      client.getDocumentByIdReferencedDescendants(id, { skip, take }, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema.shape, typeof getDocumentByIdReferencedDescendantsResponse.shape>;

export default withStandardDecorators(GetDocumentByIdReferencedDescendantsTool);