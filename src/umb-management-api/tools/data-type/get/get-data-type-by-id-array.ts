import { UmbracoManagementClient } from "@umb-management-client";
import { getItemDataTypeQueryParams, getItemDataTypeResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult, executeGetOperation } from "@/helpers/mcp/tool-decorators.js";
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";

const GetDataTypesByIdArrayTool = {
  name: "get-data-types-by-id-array",
  description: "Gets data types by IDs (or empty array if no IDs are provided)",
  inputSchema: getItemDataTypeQueryParams.shape,
  outputSchema: getItemDataTypeResponse,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['list'],
  handler: (async (params: { id?: string[] }) => {
    return executeGetOperation((client) => 
      client.getItemDataType(params)
    );
  }),
} satisfies ToolDefinition<typeof getItemDataTypeQueryParams.shape, typeof getItemDataTypeResponse>;

export default withStandardDecorators(GetDataTypesByIdArrayTool);
