import { GetTreeTemplateRootParams } from "@/umb-management-api/schemas/index.js";
import { getTreeTemplateRootQueryParams, getTreeTemplateRootResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetTemplateRootTool = {
  name: "get-template-root",
  description: "Gets root items for templates.",
  inputSchema: getTreeTemplateRootQueryParams.shape,
  outputSchema: getTreeTemplateRootResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeTemplateRootParams) => {
    return executeGetApiCall((client) =>
      client.getTreeTemplateRoot(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeTemplateRootQueryParams.shape, typeof getTreeTemplateRootResponse.shape>;

export default withStandardDecorators(GetTemplateRootTool);