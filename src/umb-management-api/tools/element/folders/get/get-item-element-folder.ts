import { getItemElementFolderQueryParams, getItemElementFolderResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoElementPermissions } from "../../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const outputSchema = z.object({
  items: getItemElementFolderResponse,
});

const GetItemElementFolderTool = {
  name: "get-item-element-folder",
  description: "Gets element folder items by their ids",
  inputSchema: getItemElementFolderQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['list', 'folders'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoElementPermissions.Read),
  handler: (async (params: z.infer<typeof getItemElementFolderQueryParams>) => {
    return executeGetItemsApiCall((client) =>
      client.getItemElementFolder(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemElementFolderQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetItemElementFolderTool);
