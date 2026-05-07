import { putDocumentByIdMoveToRecycleBinParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
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

const MoveDocumentToRecycleBinTool = {
  name: "move-document-to-recycle-bin",
  description: "Move a document to the recycle bin",
  inputSchema: putDocumentByIdMoveToRecycleBinParams.shape,
  outputSchema: emptyOutputShape,
  annotations: {},
  slices: ['move', 'recycle-bin'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Delete),
  handler: (async ({ id }: { id: string }) => {
    return executeVoidApiCallWithEmptyOutput((client) =>
      client.putDocumentByIdMoveToRecycleBin(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof putDocumentByIdMoveToRecycleBinParams.shape, EmptyOutputShape>;

export default withStandardDecorators(MoveDocumentToRecycleBinTool);
