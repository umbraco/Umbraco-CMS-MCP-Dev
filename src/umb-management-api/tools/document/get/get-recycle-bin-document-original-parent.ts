import { getRecycleBinDocumentByIdOriginalParentParams, getRecycleBinDocumentByIdOriginalParentResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetRecycleBinDocumentOriginalParentTool = {
  name: "get-recycle-bin-document-original-parent",
  description: `Get the original parent location of a document item in the recycle bin
  Returns information about where the document item was located before deletion.`,
  inputSchema: getRecycleBinDocumentByIdOriginalParentParams.shape,
  outputSchema: getRecycleBinDocumentByIdOriginalParentResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['read', 'recycle-bin'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getRecycleBinDocumentByIdOriginalParent(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getRecycleBinDocumentByIdOriginalParentParams.shape, typeof getRecycleBinDocumentByIdOriginalParentResponse.shape>;

export default withStandardDecorators(GetRecycleBinDocumentOriginalParentTool);