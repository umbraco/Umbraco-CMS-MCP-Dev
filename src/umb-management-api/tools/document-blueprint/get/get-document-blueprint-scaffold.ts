import { getDocumentBlueprintByIdScaffoldParams, getDocumentBlueprintByIdScaffoldResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetDocumentBlueprintScaffoldTool = {
  name: "get-document-blueprint-scaffold",
  description: `Get scaffold information for a document blueprint
  Use this to retrieve the scaffold structure and default values for a document blueprint, typically used when creating new documents from blueprints.`,
  inputSchema: getDocumentBlueprintByIdScaffoldParams.shape,
  outputSchema: getDocumentBlueprintByIdScaffoldResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getDocumentBlueprintByIdScaffold(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getDocumentBlueprintByIdScaffoldParams.shape, typeof getDocumentBlueprintByIdScaffoldResponse.shape>;

export default withStandardDecorators(GetDocumentBlueprintScaffoldTool);
