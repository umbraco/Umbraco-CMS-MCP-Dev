import {
  putMediaTypeFolderByIdParams,
  putMediaTypeFolderByIdBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const inputSchema = z.object({
  id: putMediaTypeFolderByIdParams.shape.id,
  data: z.object(putMediaTypeFolderByIdBody.shape),
});

const UpdateMediaTypeFolderTool = {
  name: "update-media-type-folder",
  description: "Updates a media type folder by Id",
  inputSchema: inputSchema.shape,
  annotations: { idempotentHint: true },
  slices: ['update', 'folders'],
  handler: (async (model: { id: string; data: { name: string } }) => {
    return executeVoidApiCall((client) =>
      client.putMediaTypeFolderById(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema.shape>;

export default withStandardDecorators(UpdateMediaTypeFolderTool);
