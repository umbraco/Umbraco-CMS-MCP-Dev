import { GetTreeTemplateSiblingsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeTemplateSiblingsQueryParams, getTreeTemplateSiblingsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetTemplateSiblingsTool = {
  name: "get-template-siblings",
  description: "Gets sibling templates for a given descendant id",
  inputSchema: getTreeTemplateSiblingsQueryParams.shape,
  outputSchema: getTreeTemplateSiblingsResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeTemplateSiblingsParams) => {
    return executeGetApiCall((client) =>
      client.getTreeTemplateSiblings(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeTemplateSiblingsQueryParams.shape, typeof getTreeTemplateSiblingsResponse.shape>;

export default withStandardDecorators(GetTemplateSiblingsTool);
