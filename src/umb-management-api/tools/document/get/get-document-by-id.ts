import { getDocumentByIdParams, getDocumentByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";

const GetDocumentByIdTool = {
  name: "get-document-by-id",
  description: `Gets a document by id
  Use this to retrieve existing documents. When creating new documents,
  first get an existing document of similar type, then use the Copy document endpoint.`,
  inputSchema: getDocumentByIdParams.shape,
  outputSchema: getDocumentByIdResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['read'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Read),
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getDocumentById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getDocumentByIdParams.shape, typeof getDocumentByIdResponse.shape>;

export default withStandardDecorators(GetDocumentByIdTool);
