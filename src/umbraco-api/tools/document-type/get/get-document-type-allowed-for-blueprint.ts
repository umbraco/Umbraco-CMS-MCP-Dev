import { getDocumentTypeAllowedForBlueprintQueryParams, getDocumentTypeAllowedForBlueprintResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { GetDocumentTypeAllowedForBlueprintParams } from "@/umbraco-api/schemas/index.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetDocumentTypeAllowedForBlueprintTool = {
  name: "get-document-type-allowed-for-blueprint",
  description: `Gets the document types a document blueprint can be created for.
  Pass parentKey (a document blueprint folder Id) to get the types allowed in that folder, or omit it for the root.
  Use before create-document-blueprint to pick a valid documentType.`,
  inputSchema: getDocumentTypeAllowedForBlueprintQueryParams.shape,
  outputSchema: getDocumentTypeAllowedForBlueprintResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['configuration'],
  handler: (async (model: GetDocumentTypeAllowedForBlueprintParams) => {
    return executeGetApiCall((client) =>
      client.getDocumentTypeAllowedForBlueprint(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getDocumentTypeAllowedForBlueprintQueryParams.shape, typeof getDocumentTypeAllowedForBlueprintResponse.shape>;

export default withStandardDecorators(GetDocumentTypeAllowedForBlueprintTool);
