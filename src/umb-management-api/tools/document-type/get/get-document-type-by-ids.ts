import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { getDocumentTypeByIdParams, getDocumentTypeByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetDocumentTypeByIdTool = {
  name: "get-document-type-by-id",
  description: "Gets a document type by id",
  inputSchema: getDocumentTypeByIdParams.shape,
  outputSchema: getDocumentTypeByIdResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['list'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getDocumentTypeById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getDocumentTypeByIdParams.shape, typeof getDocumentTypeByIdResponse.shape>;

export default withStandardDecorators(GetDocumentTypeByIdTool);
