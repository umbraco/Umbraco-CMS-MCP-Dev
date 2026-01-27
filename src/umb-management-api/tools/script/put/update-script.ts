import { UpdateScriptRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  putScriptByPathBody,
  putScriptByPathParams,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const updateScriptSchema = {
  path: putScriptByPathParams.shape.path,
  data: z.object(putScriptByPathBody.shape),
};

const UpdateScriptTool = {
  name: "update-script",
  description: "Updates a script by path",
  inputSchema: updateScriptSchema,
  annotations: { idempotentHint: true },
  slices: ['update'],
  handler: (async (model: { path: string; data: UpdateScriptRequestModel }) => {
    return executeVoidApiCall((client) =>
      client.putScriptByPath(model.path, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof updateScriptSchema>;

export default withStandardDecorators(UpdateScriptTool);
