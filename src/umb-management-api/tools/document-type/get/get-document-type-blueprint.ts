import { getDocumentTypeByIdBlueprintParams, getDocumentTypeByIdBlueprintResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetDocumentTypeBlueprintTool = {
  name: "get-document-type-blueprint",
  description: "Gets the blueprints for a document type",
  inputSchema: getDocumentTypeByIdBlueprintParams.shape,
  outputSchema: getDocumentTypeByIdBlueprintResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['blueprints'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getDocumentTypeByIdBlueprint(id, {}, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getDocumentTypeByIdBlueprintParams.shape, typeof getDocumentTypeByIdBlueprintResponse.shape>;

export default withStandardDecorators(GetDocumentTypeBlueprintTool);
