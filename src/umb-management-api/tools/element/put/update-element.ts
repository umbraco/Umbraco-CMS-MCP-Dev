import {
  putElementByIdParams,
  putElementByIdBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoElementPermissions } from "../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const inputSchema = {
  id: putElementByIdParams.shape.id,
  data: z.object(putElementByIdBody.shape),
};

const UpdateElementTool = {
  name: "update-element",
  description: `Updates an element by Id. This is the only tool for changing an element's values and variants, so send a complete payload.

  - Always read the current element first with get-element-by-id.
  - Send the full set of values AND variants. The update replaces them wholesale: any value or variant you omit is removed.
  - Include one variant entry per existing culture (each with its name); do not drop variants you aren't changing.`,
  inputSchema: inputSchema,
  annotations: {
    idempotentHint: true,
  },
  slices: ['update'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoElementPermissions.Update),
  handler: (async (model: { id: string; data: any }) => {
    return executeVoidApiCall((client) =>
      client.putElementById(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema>;

export default withStandardDecorators(UpdateElementTool);
