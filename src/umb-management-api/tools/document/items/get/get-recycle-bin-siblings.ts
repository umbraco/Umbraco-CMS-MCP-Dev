import { getRecycleBinDocumentSiblingsQueryParams, getRecycleBinDocumentSiblingsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetDocumentRecycleBinSiblingsTool = {
  name: "get-document-recycle-bin-siblings",
  description: "Gets sibling documents in the recycle bin for a given descendant id",
  inputSchema: getRecycleBinDocumentSiblingsQueryParams.shape,
  outputSchema: getRecycleBinDocumentSiblingsResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['tree', 'recycle-bin'],
  handler: (async (params: z.infer<typeof getRecycleBinDocumentSiblingsQueryParams>) => {
    return executeGetApiCall((client) =>
      client.getRecycleBinDocumentSiblings(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getRecycleBinDocumentSiblingsQueryParams.shape, typeof getRecycleBinDocumentSiblingsResponse.shape>;

export default withStandardDecorators(GetDocumentRecycleBinSiblingsTool);
