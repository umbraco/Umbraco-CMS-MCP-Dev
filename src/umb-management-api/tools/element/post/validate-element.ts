import { postElementValidateBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoElementPermissions } from "../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const ValidateElementTool = {
  name: "validate-element",
  description: "Validates a create element model, using the Umbraco API.",
  inputSchema: postElementValidateBody.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['validate'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoElementPermissions.Create),
  handler: (async (model: z.infer<typeof postElementValidateBody>) => {
    return executeVoidApiCall((client) =>
      client.postElementValidate(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof postElementValidateBody.shape>;

export default withStandardDecorators(ValidateElementTool);
