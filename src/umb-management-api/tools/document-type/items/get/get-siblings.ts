import { GetTreeDocumentTypeSiblingsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeDocumentTypeSiblingsQueryParams, getTreeDocumentTypeSiblingsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetDocumentTypeSiblingsTool = {
  name: "get-document-type-siblings",
  description: "Gets sibling document types or document type folders for a given descendant id",
  inputSchema: getTreeDocumentTypeSiblingsQueryParams.shape,
  outputSchema: getTreeDocumentTypeSiblingsResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeDocumentTypeSiblingsParams) => {
    return executeGetApiCall((client) =>
      client.getTreeDocumentTypeSiblings(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeDocumentTypeSiblingsQueryParams.shape, typeof getTreeDocumentTypeSiblingsResponse.shape>;

export default withStandardDecorators(GetDocumentTypeSiblingsTool);
