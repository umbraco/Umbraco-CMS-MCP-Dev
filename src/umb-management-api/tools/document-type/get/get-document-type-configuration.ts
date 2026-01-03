import { getDocumentTypeConfigurationResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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
