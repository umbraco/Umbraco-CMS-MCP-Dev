import { getDocumentBlueprintByIdParams, getDocumentBlueprintByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetDocumentBlueprintTool = {
  name: "get-document-blueprint",
  description: "Gets a document blueprint by Id",
  inputSchema: getDocumentBlueprintByIdParams.shape,
  outputSchema: getDocumentBlueprintByIdResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getDocumentBlueprintById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getDocumentBlueprintByIdParams.shape, typeof getDocumentBlueprintByIdResponse.shape>;

export default withStandardDecorators(GetDocumentBlueprintTool);
