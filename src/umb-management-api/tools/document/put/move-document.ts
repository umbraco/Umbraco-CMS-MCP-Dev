import { putDocumentByIdMoveBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";
import {
  emptyOutputShape,
  executeVoidApiCallWithEmptyOutput,
  type EmptyOutputShape,
} from "../../shared/execute-void-with-empty-output.js";

const inputSchema = {
  id: z.string().uuid(),
  data: z.object(putDocumentByIdMoveBody.shape),
};

const MoveDocumentTool = {
  name: "move-document",
  description: "Move a document to a new location",
  inputSchema: inputSchema,
  outputSchema: emptyOutputShape,
  annotations: {},
  slices: ['move'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Move),
  handler: (async (model: { id: string; data: any }) => {
    return executeVoidApiCallWithEmptyOutput((client) =>
      client.putDocumentByIdMove(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema, EmptyOutputShape>;

export default withStandardDecorators(MoveDocumentTool);
