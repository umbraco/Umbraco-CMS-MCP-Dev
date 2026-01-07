import { getDocumentBlueprintFolderByIdParams, getDocumentBlueprintFolderByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetDocumentBlueprintFolderTool = {
  name: "get-document-blueprint-folder",
  description: "Gets a document blueprint folder by Id",
  inputSchema: getDocumentBlueprintFolderByIdParams.shape,
  outputSchema: getDocumentBlueprintFolderByIdResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read', 'folders'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getDocumentBlueprintFolderById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getDocumentBlueprintFolderByIdParams.shape, typeof getDocumentBlueprintFolderByIdResponse.shape>;

export default withStandardDecorators(GetDocumentBlueprintFolderTool);
