import { deleteRedirectManagementByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";
import {
  emptyOutputShape,
  executeVoidApiCallWithEmptyOutput,
  type EmptyOutputShape,
} from "../../shared/execute-void-with-empty-output.js";

const DeleteRedirectTool = {
  name: "delete-redirect",
  description: `Deletes a specific redirect by its ID.
  Parameters:
  - id: The unique identifier of the redirect to delete (string)`,
  inputSchema: deleteRedirectManagementByIdParams.shape,
  outputSchema: emptyOutputShape,
  annotations: {
    destructiveHint: true,
  },
  slices: ['delete'],
  handler: (async ({ id }: { id: string }) => {
    return executeVoidApiCallWithEmptyOutput((client) =>
      client.deleteRedirectManagementById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof deleteRedirectManagementByIdParams.shape, EmptyOutputShape>;

export default withStandardDecorators(DeleteRedirectTool);
