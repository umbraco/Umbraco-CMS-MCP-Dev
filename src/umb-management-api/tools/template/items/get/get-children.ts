import { GetTreeTemplateChildrenParams } from "@/umb-management-api/schemas/index.js";
import { getTreeTemplateChildrenQueryParams, getTreeTemplateChildrenResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetTemplateChildrenTool = {
  name: "get-template-children",
  description: "Gets the children templates or template folders by the parent id",
  inputSchema: getTreeTemplateChildrenQueryParams.shape,
  outputSchema: getTreeTemplateChildrenResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeTemplateChildrenParams) => {
    return executeGetApiCall((client) =>
      client.getTreeTemplateChildren(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeTemplateChildrenQueryParams.shape, typeof getTreeTemplateChildrenResponse.shape>;

export default withStandardDecorators(GetTemplateChildrenTool);
