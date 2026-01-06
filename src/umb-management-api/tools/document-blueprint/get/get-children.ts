import { GetTreeDocumentBlueprintChildrenParams } from "@/umb-management-api/schemas/index.js";
import { getTreeDocumentBlueprintChildrenQueryParams, getTreeDocumentBlueprintChildrenResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, CAPTURE_RAW_HTTP_RESPONSE, executeGetApiCall } from "@/helpers/mcp/index.js";
import { z } from "zod";

const GetDocumentBlueprintChildrenTool = {
  name: "get-document-blueprint-children",
  description: "Gets the children of a document blueprint by Id",
  inputSchema: getTreeDocumentBlueprintChildrenQueryParams.shape,
  outputSchema: getTreeDocumentBlueprintChildrenResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeDocumentBlueprintChildrenParams) => {
    return executeGetApiCall((client) =>
      client.getTreeDocumentBlueprintChildren(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeDocumentBlueprintChildrenQueryParams.shape, typeof getTreeDocumentBlueprintChildrenResponse.shape>;

export default withStandardDecorators(GetDocumentBlueprintChildrenTool);
