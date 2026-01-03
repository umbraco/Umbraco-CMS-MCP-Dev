import { getDataTypeConfigurationResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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
