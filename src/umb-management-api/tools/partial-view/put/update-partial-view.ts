import { UpdatePartialViewRequestModel } from "@/umb-management-api/schemas/index.js";
import { putPartialViewByPathParams, putPartialViewByPathBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const updatePartialViewSchema = z.object({
  path: putPartialViewByPathParams.shape.path,
  data: z.object(putPartialViewByPathBody.shape),
});

const UpdatePartialViewTool = {
  name: "update-partial-view",
  description: "Updates a partial view",
  inputSchema: updatePartialViewSchema.shape,
  annotations: {
    idempotentHint: true,
  },
  slices: ['update'],
  handler: (async (model: { path: string; data: UpdatePartialViewRequestModel }) => {
    return executeVoidApiCall((client) =>
      client.putPartialViewByPath(model.path, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof updatePartialViewSchema.shape>;

export default withStandardDecorators(UpdatePartialViewTool);