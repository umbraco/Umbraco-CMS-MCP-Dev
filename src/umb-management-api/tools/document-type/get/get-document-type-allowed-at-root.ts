import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { getDocumentTypeAllowedAtRootQueryParams, getDocumentTypeAllowedAtRootResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetDocumentTypeAllowedAtRootParams } from "@/umb-management-api/schemas/index.js";

const GetDocumentTypeAllowedAtRootTool = {
  name: "get-document-type-allowed-at-root",
  description: "Get document types that are allowed at root level",
  inputSchema: getDocumentTypeAllowedAtRootQueryParams.shape,
  outputSchema: getDocumentTypeAllowedAtRootResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['configuration'],
  handler: (async (model: GetDocumentTypeAllowedAtRootParams) => {
    return executeGetApiCall((client) =>
      client.getDocumentTypeAllowedAtRoot(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getDocumentTypeAllowedAtRootQueryParams.shape, typeof getDocumentTypeAllowedAtRootResponse.shape>;

export default withStandardDecorators(GetDocumentTypeAllowedAtRootTool);
