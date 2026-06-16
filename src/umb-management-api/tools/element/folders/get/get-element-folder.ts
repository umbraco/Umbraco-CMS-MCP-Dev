import { getElementFolderByIdParams, getElementFolderByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoElementPermissions } from "../../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetElementFolderTool = {
  name: "get-element-folder",
  description: "Gets an element folder by Id",
  inputSchema: getElementFolderByIdParams.shape,
  outputSchema: getElementFolderByIdResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read', 'folders'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoElementPermissions.Read),
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getElementFolderById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getElementFolderByIdParams.shape, typeof getElementFolderByIdResponse.shape>;

export default withStandardDecorators(GetElementFolderTool);
