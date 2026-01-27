import { RenamePartialViewRequestModel } from "@/umb-management-api/schemas/index.js";
import { putPartialViewByPathRenameParams, putPartialViewByPathRenameBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const renamePartialViewSchema = z.object({
  path: putPartialViewByPathRenameParams.shape.path,
  data: z.object(putPartialViewByPathRenameBody.shape),
});

const RenamePartialViewTool = {
  name: "rename-partial-view",
  description: "Renames a partial view",
  inputSchema: renamePartialViewSchema.shape,
  annotations: {
    idempotentHint: true,
  },
  slices: ['rename'],
  handler: (async (model: { path: string; data: RenamePartialViewRequestModel }) => {
    // URL encode the path to handle forward slashes properly
    const normalizedPath = encodeURIComponent(model.path);

    return executeVoidApiCall((client) =>
      client.putPartialViewByPathRename(normalizedPath, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof renamePartialViewSchema.shape>;

export default withStandardDecorators(RenamePartialViewTool);