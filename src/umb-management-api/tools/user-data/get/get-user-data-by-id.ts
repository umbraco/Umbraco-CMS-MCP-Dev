import { getUserDataByIdParams, getUserDataByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetUserDataByIdTool = {
  name: "get-user-data-by-id",
  description: "Retrieves a specific personal key-value storage record by its unique identifier for the authenticated user. User data stores user preferences, settings, and configuration values that persist permanently and are organized by group (category) and identifier (key).",
  inputSchema: getUserDataByIdParams.shape,
  outputSchema: getUserDataByIdResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getUserDataById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getUserDataByIdParams.shape, typeof getUserDataByIdResponse.shape>;

export default withStandardDecorators(GetUserDataByIdTool);