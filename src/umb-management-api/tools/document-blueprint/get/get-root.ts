import { GetTreeDocumentBlueprintRootParams } from "@/umb-management-api/schemas/index.js";
import { getTreeDocumentBlueprintRootQueryParams, getTreeDocumentBlueprintRootResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetDocumentBlueprintRootTool = {
  name: "get-document-blueprint-root",
  description: "Gets the root level of the document blueprint tree",
  inputSchema: getTreeDocumentBlueprintRootQueryParams.shape,
  outputSchema: getTreeDocumentBlueprintRootResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeDocumentBlueprintRootParams) => {
    return executeGetApiCall((client) =>
      client.getTreeDocumentBlueprintRoot(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeDocumentBlueprintRootQueryParams.shape, typeof getTreeDocumentBlueprintRootResponse.shape>;

export default withStandardDecorators(GetDocumentBlueprintRootTool);
