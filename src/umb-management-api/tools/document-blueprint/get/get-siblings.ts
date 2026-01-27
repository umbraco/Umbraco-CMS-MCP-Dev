import { GetTreeDocumentBlueprintSiblingsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeDocumentBlueprintSiblingsQueryParams, getTreeDocumentBlueprintSiblingsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetDocumentBlueprintSiblingsTool = {
  name: "get-document-blueprint-siblings",
  description: "Gets sibling document blueprints for a given descendant id",
  inputSchema: getTreeDocumentBlueprintSiblingsQueryParams.shape,
  outputSchema: getTreeDocumentBlueprintSiblingsResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeDocumentBlueprintSiblingsParams) => {
    return executeGetApiCall((client) =>
      client.getTreeDocumentBlueprintSiblings(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeDocumentBlueprintSiblingsQueryParams.shape, typeof getTreeDocumentBlueprintSiblingsResponse.shape>;

export default withStandardDecorators(GetDocumentBlueprintSiblingsTool);
