import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { getDocumentTypeByIdBlueprintParams, getDocumentTypeByIdBlueprintResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";

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
