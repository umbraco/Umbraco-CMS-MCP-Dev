import { getDataTypeConfigurationResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetOperation, FULL_RESPONSE_OPTIONS } from "@/helpers/mcp/tool-decorators.js";

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
    return executeGetOperation((client) => 
      client.getDataTypeConfiguration(FULL_RESPONSE_OPTIONS)
    );
  }),
} satisfies ToolDefinition<{}, typeof getDataTypeConfigurationResponse.shape>;

export default withStandardDecorators(GetDataTypeConfigurationTool);
