import { getRecycleBinDocumentRootQueryParams, getRecycleBinDocumentRootResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetRecycleBinDocumentRootTool = {
  name: "get-recycle-bin-document-root",
  description: "Gets root items for the document recycle bin.",
  inputSchema: getRecycleBinDocumentRootQueryParams.shape,
  outputSchema: getRecycleBinDocumentRootResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['tree', 'recycle-bin'],
  handler: (async (params: z.infer<typeof getRecycleBinDocumentRootQueryParams>) => {
    return executeGetApiCall((client) =>
      client.getRecycleBinDocumentRoot(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getRecycleBinDocumentRootQueryParams.shape, typeof getRecycleBinDocumentRootResponse.shape>;

export default withStandardDecorators(GetRecycleBinDocumentRootTool);
