import { GetUserCurrentPermissionsDocumentParams } from "@/umbraco-api/schemas/index.js";
import {
  getUserCurrentPermissionsDocumentQueryParams,
  getUserCurrentPermissionsDocumentResponse,
} from "@/umbraco-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetUserCurrentPermissionsDocumentTool = {
  name: "get-user-current-permissions-document",
  description: "Gets the current user's document permissions for specific documents",
  inputSchema: getUserCurrentPermissionsDocumentQueryParams.shape,
  outputSchema: getUserCurrentPermissionsDocumentResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['permissions'],
  handler: (async (params: GetUserCurrentPermissionsDocumentParams) => {
    return executeGetApiCall((client) =>
      client.getUserCurrentPermissionsDocument(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getUserCurrentPermissionsDocumentQueryParams.shape, typeof getUserCurrentPermissionsDocumentResponse.shape>;

export default withStandardDecorators(GetUserCurrentPermissionsDocumentTool);
