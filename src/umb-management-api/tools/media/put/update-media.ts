import { UpdateMediaRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  putMediaByIdParams,
  putMediaByIdBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
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
  id: putMediaByIdParams.shape.id,
  data: z.object(putMediaByIdBody.shape),
};

const UpdateMediaTool = {
  name: "update-media",
  description: `Updates a media item by Id. Works for all media types including folders, images, files, videos, etc.
  Always read the current media value first and only update the required values.
  Don't miss any properties from the original media that you are updating.
  This cannot be used for moving media to a new folder. Use the move endpoint to do that.`,
  inputSchema,
  outputSchema: emptyOutputShape,
  annotations: {
    idempotentHint: true,
  },
  slices: ['update'],
  handler: (async (model: { id: string; data: UpdateMediaRequestModel }) => {
    return executeVoidApiCallWithEmptyOutput((client) =>
      client.putMediaById(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema, EmptyOutputShape>;

export default withStandardDecorators(UpdateMediaTool);
