import { GetUserCurrentPermissionsDocumentParams } from "@/umb-management-api/schemas/index.js";
import {
  getUserCurrentPermissionsDocumentQueryParams,
  getUserCurrentPermissionsDocumentResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { executeGetApiCall } from "@/helpers/mcp/index.js";
import { z } from "zod";

// Wrap array response in object for MCP compliance
const outputSchema = z.object({
  items: getUserCurrentPermissionsDocumentResponse,
});

const GetUserCurrentPermissionsDocumentTool = {
  name: "get-user-current-permissions-document",
  description: "Gets the current user's document permissions for specific documents",
  inputSchema: getUserCurrentPermissionsDocumentQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['permissions'],
  handler: (async (params: GetUserCurrentPermissionsDocumentParams) => {
    return executeGetApiCall((client) =>
      client.getUserCurrentPermissionsDocument(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getUserCurrentPermissionsDocumentQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetUserCurrentPermissionsDocumentTool);
