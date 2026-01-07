import { GetUserDataParams } from "@/umb-management-api/schemas/index.js";
import { getUserDataQueryParams, getUserDataResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetUserDataTool = {
  name: "get-user-data",
  description: "Retrieves user data records with pagination and filtering",
  inputSchema: getUserDataQueryParams.shape,
  outputSchema: getUserDataResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async (params: GetUserDataParams) => {
    return executeGetApiCall((client) =>
      client.getUserData(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getUserDataQueryParams.shape, typeof getUserDataResponse.shape>;

export default withStandardDecorators(GetUserDataTool);