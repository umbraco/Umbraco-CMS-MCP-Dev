import {
  putElementFolderByIdParams,
  putElementFolderByIdBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoElementPermissions } from "../../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const updateElementFolderSchema = z.object({
  id: putElementFolderByIdParams.shape.id,
  data: z.object(putElementFolderByIdBody.shape),
});

type UpdateElementFolderParams = z.infer<typeof updateElementFolderSchema>;

const UpdateElementFolderTool = {
  name: "update-element-folder",
  description: "Updates an element folder",
  inputSchema: updateElementFolderSchema.shape,
  annotations: { idempotentHint: true },
  slices: ['update', 'folders'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoElementPermissions.Update),
  handler: (async ({ id, data }: UpdateElementFolderParams) => {
    return executeVoidApiCall((client) =>
      client.putElementFolderById(id, data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof updateElementFolderSchema.shape>;

export default withStandardDecorators(UpdateElementFolderTool);
