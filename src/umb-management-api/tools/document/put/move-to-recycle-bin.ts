import { putDocumentByIdMoveToRecycleBinParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const MoveDocumentToRecycleBinTool = {
  name: "move-document-to-recycle-bin",
  description: "Move a document to the recycle bin",
  inputSchema: putDocumentByIdMoveToRecycleBinParams.shape,
  annotations: {},
  slices: ['move', 'recycle-bin'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Delete),
  handler: (async ({ id }: { id: string }) => {
    return executeVoidApiCall((client) =>
      client.putDocumentByIdMoveToRecycleBin(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof putDocumentByIdMoveToRecycleBinParams.shape>;

export default withStandardDecorators(MoveDocumentToRecycleBinTool);
