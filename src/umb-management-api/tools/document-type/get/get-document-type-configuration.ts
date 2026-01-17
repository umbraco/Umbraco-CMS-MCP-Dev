import { getDocumentTypeConfigurationResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetDocumentTypeConfigurationTool = {
  name: "get-document-type-configuration",
  description: "Gets the global configuration for document types",
  inputSchema: {},
  outputSchema: getDocumentTypeConfigurationResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['configuration'],
  handler: (async () => {
    return executeGetApiCall((client) =>
      client.getDocumentTypeConfiguration(CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<{}, typeof getDocumentTypeConfigurationResponse.shape>;

export default withStandardDecorators(GetDocumentTypeConfigurationTool);
