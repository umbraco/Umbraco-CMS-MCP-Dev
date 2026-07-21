import { putElementByIdValidateBody } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umbraco-api/schemas/index.js";
import { UmbracoElementPermissions } from "../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const inputSchema = {
  id: z.string().uuid(),
  data: z.object(putElementByIdValidateBody.shape),
};

const ValidateElementUpdateTool = {
  name: "validate-element-update",
  description: "Validates the request model for updating an element without actually updating it.",
  inputSchema: inputSchema,
  annotations: {},
  slices: ['update'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoElementPermissions.Update),
  handler: (async (model: { id: string; data: any }) => {
    return executeVoidApiCall((client) =>
      client.putElementByIdValidate(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema>;

export default withStandardDecorators(ValidateElementUpdateTool);
