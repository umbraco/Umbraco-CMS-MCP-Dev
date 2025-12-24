import { getRecycleBinDocumentRootQueryParams, getRecycleBinDocumentRootResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

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
