import { putRecycleBinMediaByIdRestoreParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const RestoreFromRecycleBinTool = {
  name: "restore-media-from-recycle-bin",
  description: "Restores a media item from the recycle bin.",
  inputSchema: putRecycleBinMediaByIdRestoreParams.shape,
  annotations: {
    idempotentHint: true,
  },
  slices: ['move', 'recycle-bin'],
  handler: (async ({ id }: { id: string }) => {
    return executeVoidApiCall((client) =>
      client.putRecycleBinMediaByIdRestore(id, { target: null }, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof putRecycleBinMediaByIdRestoreParams.shape>;

export default withStandardDecorators(RestoreFromRecycleBinTool);
