import { deleteRedirectManagementByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const DeleteRedirectTool = {
  name: "delete-redirect",
  description: `Deletes a specific redirect by its ID.
  Parameters:
  - id: The unique identifier of the redirect to delete (string)`,
  inputSchema: deleteRedirectManagementByIdParams.shape,
  annotations: {
    destructiveHint: true,
  },
  slices: ['delete'],
  handler: (async ({ id }: { id: string }) => {
    return executeVoidApiCall((client) =>
      client.deleteRedirectManagementById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof deleteRedirectManagementByIdParams.shape>;

export default withStandardDecorators(DeleteRedirectTool);
