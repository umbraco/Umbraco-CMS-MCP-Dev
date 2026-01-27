import { putRecycleBinDocumentByIdRestoreParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const RestoreFromRecycleBinTool = {
  name: "restore-document-from-recycle-bin",
  description: "Restores a document from the recycle bin.",
  inputSchema: putRecycleBinDocumentByIdRestoreParams.shape,
  annotations: {},
  slices: ['move','recycle-bin'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Delete),
  handler: (async ({ id }: { id: string }) => {
    return executeVoidApiCall((client) =>
      client.putRecycleBinDocumentByIdRestore(id, { target: null }, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof putRecycleBinDocumentByIdRestoreParams.shape>;

export default withStandardDecorators(RestoreFromRecycleBinTool);
