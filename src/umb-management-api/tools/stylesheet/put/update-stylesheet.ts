import { UpdateStylesheetRequestModel } from "@/umb-management-api/schemas/index.js";
import { putStylesheetByPathParams, putStylesheetByPathBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const updateStylesheetSchema = z.object({
  ...putStylesheetByPathParams.shape,
  ...putStylesheetByPathBody.shape,
});

const UpdateStylesheetTool = {
  name: "update-stylesheet",
  description: "Updates a stylesheet by path",
  inputSchema: updateStylesheetSchema.shape,
  annotations: { idempotentHint: true },
  slices: ['update'],
  handler: (async (model: { path: string } & UpdateStylesheetRequestModel) => {
    const { path, ...updateModel } = model;
    return executeVoidApiCall((client) =>
      client.putStylesheetByPath(path, updateModel, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof updateStylesheetSchema.shape>;

export default withStandardDecorators(UpdateStylesheetTool);
