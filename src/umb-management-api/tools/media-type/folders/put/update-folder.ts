import {
  putMediaTypeFolderByIdParams,
  putMediaTypeFolderByIdBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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
