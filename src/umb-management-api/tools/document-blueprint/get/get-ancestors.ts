import { GetTreeDocumentBlueprintAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeDocumentBlueprintAncestorsQueryParams, getTreeDocumentBlueprintAncestorsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const outputSchema = z.object({
  items: getTreeDocumentBlueprintAncestorsResponse,
});

const GetDocumentBlueprintAncestorsTool = {
  name: "get-document-blueprint-ancestors",
  description: "Gets the ancestors of a document blueprint by Id",
  inputSchema: getTreeDocumentBlueprintAncestorsQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeDocumentBlueprintAncestorsParams) => {
    return executeGetItemsApiCall((client) =>
      client.getTreeDocumentBlueprintAncestors(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeDocumentBlueprintAncestorsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDocumentBlueprintAncestorsTool);
