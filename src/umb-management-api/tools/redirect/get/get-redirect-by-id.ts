import { getRedirectManagementByIdParams, getRedirectManagementByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetRedirectByIdTool = {
  name: "get-redirect-by-id",
  description: `Gets a specific redirect by its ID.
  Parameters:
  - id: The unique identifier of the redirect (string)

  Returns the redirect details.`,
  inputSchema: getRedirectManagementByIdParams.shape,
  outputSchema: getRedirectManagementByIdResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getRedirectManagementById(id, undefined, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getRedirectManagementByIdParams.shape, typeof getRedirectManagementByIdResponse.shape>;

export default withStandardDecorators(GetRedirectByIdTool);
