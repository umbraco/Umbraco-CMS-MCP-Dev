import { putRecycleBinMediaByIdRestoreParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
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

const RestoreFromRecycleBinTool = {
  name: "restore-media-from-recycle-bin",
  description: "Restores a media item from the recycle bin.",
  inputSchema: putRecycleBinMediaByIdRestoreParams.shape,
  outputSchema: emptyOutputShape,
  annotations: {
    idempotentHint: true,
  },
  slices: ['move', 'recycle-bin'],
  handler: (async ({ id }: { id: string }) => {
    return executeVoidApiCallWithEmptyOutput((client) =>
      client.putRecycleBinMediaByIdRestore(id, { target: null }, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof putRecycleBinMediaByIdRestoreParams.shape, EmptyOutputShape>;

export default withStandardDecorators(RestoreFromRecycleBinTool);
