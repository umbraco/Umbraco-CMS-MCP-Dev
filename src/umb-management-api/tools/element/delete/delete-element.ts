import { deleteElementByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoElementPermissions } from "../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const DeleteElementTool = {
  name: "delete-element",
  description: "Deletes an element by Id",
  inputSchema: deleteElementByIdParams.shape,
  annotations: {
    destructiveHint: true,
  },
  slices: ['delete'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoElementPermissions.Delete),
  handler: (async ({ id }: { id: string }) => {
    return executeVoidApiCall((client) =>
      client.deleteElementById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof deleteElementByIdParams.shape>;

export default withStandardDecorators(DeleteElementTool);
