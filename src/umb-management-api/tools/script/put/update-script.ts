import { UpdateScriptRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  putScriptByPathBody,
  putScriptByPathParams,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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
