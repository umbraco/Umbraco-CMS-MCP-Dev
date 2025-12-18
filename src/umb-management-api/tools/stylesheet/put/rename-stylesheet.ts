import { UmbracoManagementClient } from "@umb-management-client";
import { RenameStylesheetRequestModel } from "@/umb-management-api/schemas/index.js";
import { putStylesheetByPathRenameParams, putStylesheetByPathRenameBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

const renameStylesheetSchema = z.object({
  ...putStylesheetByPathRenameParams.shape,
  ...putStylesheetByPathRenameBody.shape,
});

const RenameStylesheetTool = {
  name: "rename-stylesheet",
  description: `Renames a stylesheet`,
  schema: renameStylesheetSchema.shape,
  isReadOnly: false,
  slices: ['rename'],
  handler: async (model: { path: string } & RenameStylesheetRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    const { path, ...renameModel } = model;

    // URL encode the path to handle forward slashes properly
    const normalizedPath = encodeURIComponent(path);

    var response = await client.putStylesheetByPathRename(normalizedPath, renameModel);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof renameStylesheetSchema.shape>;

export default withStandardDecorators(RenameStylesheetTool);