import { getElementVersionByIdParams, getElementVersionByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetElementVersionByIdTool = {
  name: "get-element-version-by-id",
  description: "Get a specific element version by ID",
  inputSchema: getElementVersionByIdParams.shape,
  outputSchema: getElementVersionByIdResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['read'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getElementVersionById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getElementVersionByIdParams.shape, typeof getElementVersionByIdResponse.shape>;

export default withStandardDecorators(GetElementVersionByIdTool);
