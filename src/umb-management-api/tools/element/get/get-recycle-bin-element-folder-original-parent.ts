import { getRecycleBinElementFolderByIdOriginalParentParams, getRecycleBinElementFolderByIdOriginalParentResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoElementPermissions } from "../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetRecycleBinElementFolderOriginalParentTool = {
  name: "get-recycle-bin-element-folder-original-parent",
  description: `Get the original parent location of an element folder in the recycle bin
  Returns information about where the element folder was located before deletion.`,
  inputSchema: getRecycleBinElementFolderByIdOriginalParentParams.shape,
  outputSchema: getRecycleBinElementFolderByIdOriginalParentResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['read', 'recycle-bin'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoElementPermissions.Read),
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getRecycleBinElementFolderByIdOriginalParent(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getRecycleBinElementFolderByIdOriginalParentParams.shape, typeof getRecycleBinElementFolderByIdOriginalParentResponse.shape>;

export default withStandardDecorators(GetRecycleBinElementFolderOriginalParentTool);
