import { UpdateMediaRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  putMediaByIdValidateParams,
  putMediaByIdValidateBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const inputSchema = {
  id: putMediaByIdValidateParams.shape.id,
  data: z.object(putMediaByIdValidateBody.shape),
};

const ValidateMediaUpdateTool = {
  name: "validate-media-update",
  description: "Validates media data before updating an existing media item by Id",
  inputSchema,
  annotations: { readOnlyHint: true },
  slices: ['validate'],
  handler: (async (model: { id: string; data: UpdateMediaRequestModel }) => {
    return executeVoidApiCall((client) =>
      client.putMediaByIdValidate(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema>;

export default withStandardDecorators(ValidateMediaUpdateTool);
