import { getUserByIdCalculateStartNodesParams, getUserByIdCalculateStartNodesResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetUserByIdCalculateStartNodesTool = {
  name: "get-user-by-id-calculate-start-nodes",
  description: "Calculates start nodes for a user by their ID based on permissions",
  inputSchema: getUserByIdCalculateStartNodesParams.shape,
  outputSchema: getUserByIdCalculateStartNodesResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getUserByIdCalculateStartNodes(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getUserByIdCalculateStartNodesParams.shape, typeof getUserByIdCalculateStartNodesResponse.shape>;

export default withStandardDecorators(GetUserByIdCalculateStartNodesTool);
