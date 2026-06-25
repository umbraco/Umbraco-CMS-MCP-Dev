import { deleteRecycleBinElementByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoElementPermissions } from "../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const DeleteElementFromRecycleBinTool = {
  name: "delete-element-from-recycle-bin",
  description: "Permanently deletes an element from the recycle bin by its id",
  inputSchema: deleteRecycleBinElementByIdParams.shape,
  annotations: {
    destructiveHint: true,
  },
  slices: ['delete', 'recycle-bin'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoElementPermissions.Delete),
  handler: (async ({ id }: { id: string }) => {
    return executeVoidApiCall((client) =>
      client.deleteRecycleBinElementById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof deleteRecycleBinElementByIdParams.shape>;

export default withStandardDecorators(DeleteElementFromRecycleBinTool);
