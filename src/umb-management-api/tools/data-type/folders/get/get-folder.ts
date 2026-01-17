import { getDataTypeFolderByIdParams, getDataTypeFolderByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetDataTypeFolderTool = {
  name: "get-data-type-folder",
  description: "Gets a data type folder by Id",
  inputSchema: getDataTypeFolderByIdParams.shape,
  outputSchema: getDataTypeFolderByIdResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['read', 'folders'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) => 
      client.getDataTypeFolderById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getDataTypeFolderByIdParams.shape, typeof getDataTypeFolderByIdResponse.shape>;

export default withStandardDecorators(GetDataTypeFolderTool);
