import { getRecycleBinDocumentChildrenQueryParams, getRecycleBinDocumentChildrenResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetRecycleBinDocumentChildrenTool = {
  name: "get-recycle-bin-document-children",
  description: "Gets child items for a document in the recycle bin.",
  inputSchema: getRecycleBinDocumentChildrenQueryParams.shape,
  outputSchema: getRecycleBinDocumentChildrenResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['tree', 'recycle-bin'],
  handler: (async (params: z.infer<typeof getRecycleBinDocumentChildrenQueryParams>) => {
    return executeGetApiCall((client) =>
      client.getRecycleBinDocumentChildren(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getRecycleBinDocumentChildrenQueryParams.shape, typeof getRecycleBinDocumentChildrenResponse.shape>;

export default withStandardDecorators(GetRecycleBinDocumentChildrenTool);
