import { getDocumentByIdReferencedByParams, getDocumentByIdReferencedByQueryParams, getDocumentByIdReferencedByResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const inputSchema = z.object({
  ...getDocumentByIdReferencedByParams.shape,
  ...getDocumentByIdReferencedByQueryParams.shape,
});

const GetDocumentByIdReferencedByTool = {
  name: "get-document-by-id-referenced-by",
  description: `Get items that reference a specific document item
  Use this to find all content, documents, or other items that are currently referencing a specific document item.`,
  inputSchema: inputSchema.shape,
  outputSchema: getDocumentByIdReferencedByResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['references'],
  handler: (async ({ id, skip, take }: z.infer<typeof inputSchema>) => {
    return executeGetApiCall((client) =>
      client.getDocumentByIdReferencedBy(id, { skip, take }, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema.shape, typeof getDocumentByIdReferencedByResponse.shape>;

export default withStandardDecorators(GetDocumentByIdReferencedByTool);