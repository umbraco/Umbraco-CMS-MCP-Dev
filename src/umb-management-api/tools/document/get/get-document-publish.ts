import { getDocumentByIdPublishedParams, getDocumentByIdPublishedResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetDocumentPublishTool = {
  name: "get-document-publish",
  description: "Gets the published state of a document by Id.",
  inputSchema: getDocumentByIdPublishedParams.shape,
  outputSchema: getDocumentByIdPublishedResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['publish'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Read),
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getDocumentByIdPublished(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getDocumentByIdPublishedParams.shape, typeof getDocumentByIdPublishedResponse.shape>;

export default withStandardDecorators(GetDocumentPublishTool);
