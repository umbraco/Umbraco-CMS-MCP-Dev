import { getDocumentConfigurationResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetDocumentConfigurationTool = {
  name: "get-document-configuration",
  description: "Gets the document configuration for the Umbraco instance.",
  inputSchema: {},
  outputSchema: getDocumentConfigurationResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['configuration'],
  handler: (async () => {
    return executeGetApiCall((client) =>
      client.getDocumentConfiguration(CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<{}, typeof getDocumentConfigurationResponse.shape>;

export default withStandardDecorators(GetDocumentConfigurationTool);
