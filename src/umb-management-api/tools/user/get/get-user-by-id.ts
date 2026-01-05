import { getUserByIdParams, getUserByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetUserByIdTool = {
  name: "get-user-by-id",
  description: "Gets a user by their unique identifier",
  inputSchema: getUserByIdParams.shape,
  outputSchema: getUserByIdResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getUserById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getUserByIdParams.shape, typeof getUserByIdResponse.shape>;

export default withStandardDecorators(GetUserByIdTool);
