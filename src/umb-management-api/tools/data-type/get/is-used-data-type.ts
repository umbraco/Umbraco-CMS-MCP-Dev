import { getDataTypeByIdIsUsedParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const IsUsedDataTypeTool = {
  name: "is-used-data-type",
  description: "Checks if a data type is used within Umbraco",
  inputSchema: getDataTypeByIdIsUsedParams.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['references'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getDataTypeByIdIsUsed(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getDataTypeByIdIsUsedParams.shape>;

export default withStandardDecorators(IsUsedDataTypeTool);
