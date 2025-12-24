import { getRecycleBinDocumentReferencedByQueryParams, getRecycleBinDocumentReferencedByResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

const GetRecycleBinDocumentReferencedByTool = {
  name: "get-recycle-bin-document-referenced-by",
  description: `Get references to deleted document items in the recycle bin
  Use this to find content that still references deleted document items before permanently deleting them.`,
  inputSchema: getRecycleBinDocumentReferencedByQueryParams.shape,
  outputSchema: getRecycleBinDocumentReferencedByResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['references', 'recycle-bin'],
  handler: (async ({ skip, take }: z.infer<typeof getRecycleBinDocumentReferencedByQueryParams>) => {
    return executeGetApiCall((client) =>
      client.getRecycleBinDocumentReferencedBy({ skip, take }, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getRecycleBinDocumentReferencedByQueryParams.shape, typeof getRecycleBinDocumentReferencedByResponse.shape>;

export default withStandardDecorators(GetRecycleBinDocumentReferencedByTool);