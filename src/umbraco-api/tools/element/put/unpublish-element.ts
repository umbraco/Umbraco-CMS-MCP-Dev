import { putElementByIdUnpublishBody } from "@/umbraco-api/umbracoManagementAPI.zod.js";
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
  data: z.object(putElementByIdUnpublishBody.shape),
};

const UnpublishElementTool = {
  name: "unpublish-element",
  description: "Unpublishes an element by Id.",
  inputSchema: inputSchema,
  annotations: {},
  slices: ['publish'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoElementPermissions.Unpublish),
  handler: (async (model: {
    id: string;
    data: z.infer<typeof putElementByIdUnpublishBody>;
  }) => {
    if (!model.data.cultures) model.data.cultures = null;
    return executeVoidApiCall((client) =>
      client.putElementByIdUnpublish(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema>;

export default withStandardDecorators(UnpublishElementTool);
