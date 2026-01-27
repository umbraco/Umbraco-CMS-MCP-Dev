import { getDataTypeConfigurationResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetDataTypeConfigurationTool = {
  name: "get-data-type-configuration",
  description: "Gets global data type configuration settings including change permissions and default list view IDs",
  inputSchema: {},
  outputSchema: getDataTypeConfigurationResponse.shape,
  annotations: {
    readOnlyHint: true
  },
  slices: ['configuration'],
  handler: (async () => {
    return executeGetApiCall((client) => 
      client.getDataTypeConfiguration(CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<{}, typeof getDataTypeConfigurationResponse.shape>;

export default withStandardDecorators(GetDataTypeConfigurationTool);
