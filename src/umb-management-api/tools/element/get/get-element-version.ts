import { getElementVersionQueryParams, getElementVersionResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetElementVersionParams } from "@/umb-management-api/schemas/index.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetElementVersionTool = {
  name: "get-element-version",
  description: "List element versions with pagination",
  inputSchema: getElementVersionQueryParams.shape,
  outputSchema: getElementVersionResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['list'],
  handler: (async (model: GetElementVersionParams) => {
    return executeGetApiCall((client) =>
      client.getElementVersion(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getElementVersionQueryParams.shape, typeof getElementVersionResponse.shape>;

export default withStandardDecorators(GetElementVersionTool);
