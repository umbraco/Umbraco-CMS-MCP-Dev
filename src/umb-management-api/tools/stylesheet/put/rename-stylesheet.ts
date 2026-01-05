import { RenameStylesheetRequestModel } from "@/umb-management-api/schemas/index.js";
import { putStylesheetByPathRenameParams, putStylesheetByPathRenameBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

const renameStylesheetSchema = z.object({
  ...putStylesheetByPathRenameParams.shape,
  ...putStylesheetByPathRenameBody.shape,
});

const RenameStylesheetTool = {
  name: "rename-stylesheet",
  description: `Renames a stylesheet`,
  inputSchema: renameStylesheetSchema.shape,
  annotations: { idempotentHint: true },
  slices: ['rename'],
  handler: (async (model: { path: string } & RenameStylesheetRequestModel) => {
    const { path, ...renameModel } = model;

    // URL encode the path to handle forward slashes properly
    const normalizedPath = encodeURIComponent(path);

    return executeVoidApiCall((client) =>
      client.putStylesheetByPathRename(normalizedPath, renameModel, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof renameStylesheetSchema.shape>;

export default withStandardDecorators(RenameStylesheetTool);
