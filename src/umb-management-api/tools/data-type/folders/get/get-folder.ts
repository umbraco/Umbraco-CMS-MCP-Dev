import { getDataTypeFolderByIdParams, getDataTypeFolderByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetOperation, FULL_RESPONSE_OPTIONS } from "@/helpers/mcp/tool-decorators.js";

const GetDataTypeFolderTool = {
  name: "get-data-type-folder",
  description: "Gets a data type folder by Id",
  inputSchema: getDataTypeFolderByIdParams.shape,
  outputSchema: getDataTypeFolderByIdResponse.shape,
  annotations: {
    readOnlyHint: true,
    idempotentHint: true,
  },
  slices: ['read', 'folders'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetOperation((client) => 
      client.getDataTypeFolderById(id, FULL_RESPONSE_OPTIONS)
    );
  }),
} satisfies ToolDefinition<typeof getDataTypeFolderByIdParams.shape, typeof getDataTypeFolderByIdResponse.shape>;

export default withStandardDecorators(GetDataTypeFolderTool);
