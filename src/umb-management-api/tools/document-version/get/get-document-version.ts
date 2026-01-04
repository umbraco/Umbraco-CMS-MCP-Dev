import { getDocumentVersionQueryParams, getDocumentVersionResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetDocumentVersionParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetDocumentVersionTool = {
  name: "get-document-version",
  description: "List document versions with pagination",
  inputSchema: getDocumentVersionQueryParams.shape,
  outputSchema: getDocumentVersionResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['read'],
  handler: (async (model: GetDocumentVersionParams) => {
    return executeGetApiCall((client) =>
      client.getDocumentVersion(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getDocumentVersionQueryParams.shape, typeof getDocumentVersionResponse.shape>;

export default withStandardDecorators(GetDocumentVersionTool);
