import { getDocumentBlueprintByIdParams, getDocumentBlueprintByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

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
