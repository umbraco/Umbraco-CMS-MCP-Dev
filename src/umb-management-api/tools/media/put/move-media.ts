import { MoveMediaRequestModel } from "@/umb-management-api/schemas/index.js";
import { putMediaByIdMoveParams, putMediaByIdMoveBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";
import {
  emptyOutputShape,
  executeVoidApiCallWithEmptyOutput,
  type EmptyOutputShape,
} from "../../shared/execute-void-with-empty-output.js";

const inputSchema = {
  id: putMediaByIdMoveParams.shape.id,
  data: z.object(putMediaByIdMoveBody.shape),
};

const MoveMediaTool = {
  name: "move-media",
  description: "Move a media item to a new location",
  inputSchema,
  outputSchema: emptyOutputShape,
  annotations: {
    idempotentHint: true,
  },
  slices: ['move'],
  handler: (async (model: { id: string; data: MoveMediaRequestModel }) => {
    return executeVoidApiCallWithEmptyOutput((client) =>
      client.putMediaByIdMove(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema, EmptyOutputShape>;

export default withStandardDecorators(MoveMediaTool);
