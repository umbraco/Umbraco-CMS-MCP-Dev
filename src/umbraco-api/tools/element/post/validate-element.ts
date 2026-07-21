import { postElementValidateBody } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umbraco-api/schemas/index.js";
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
