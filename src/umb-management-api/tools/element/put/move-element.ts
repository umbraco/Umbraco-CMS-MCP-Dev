import { putElementByIdMoveBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
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
  id: z.string().uuid(),
  data: z.object(putElementByIdMoveBody.shape),
};

const MoveElementTool = {
  name: "move-element",
  description: "Move an element to a new location",
  inputSchema: inputSchema,
  annotations: {},
  slices: ['move'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoElementPermissions.Move),
  handler: (async (model: { id: string; data: any }) => {
    return executeVoidApiCall((client) =>
      client.putElementByIdMove(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema>;

export default withStandardDecorators(MoveElementTool);
