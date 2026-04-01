import { putMediaTypeByIdMoveBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { MoveMediaTypeRequestModel } from "@/umb-management-api/schemas/moveMediaTypeRequestModel.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const inputSchema = z.object({
  id: z.string().uuid(),
  data: z.object(putMediaTypeByIdMoveBody.shape),
});

const MoveMediaTypeTool = {
  name: "move-media-type",
  description: "Move a media type to a new location",
  inputSchema: inputSchema.shape,
  annotations: { idempotentHint: true },
  slices: ['move'],
  handler: (async (model: { id: string; data: MoveMediaTypeRequestModel }) => {
    return executeVoidApiCall((client) =>
      client.putMediaTypeByIdMove(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema.shape>;

export default withStandardDecorators(MoveMediaTypeTool);
