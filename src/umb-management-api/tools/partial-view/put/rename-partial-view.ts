import { UmbracoManagementClient } from "@umb-management-client";
import { RenamePartialViewRequestModel } from "@/umb-management-api/schemas/index.js";
import { putPartialViewByPathRenameParams, putPartialViewByPathRenameBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const renamePartialViewSchema = z.object({
  ...putPartialViewByPathRenameParams.shape,
  ...putPartialViewByPathRenameBody.shape,
});

const RenamePartialViewTool = {
  name: "rename-partial-view",
  description: "Renames a partial view",
  schema: renamePartialViewSchema.shape,
  isReadOnly: false,
  slices: ['rename'],
  handler: async (model: { path: string } & RenamePartialViewRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    const { path, ...renameModel } = model;

    // URL encode the path to handle forward slashes properly
    const normalizedPath = encodeURIComponent(path);

    var response = await client.putPartialViewByPathRename(normalizedPath, renameModel);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof renamePartialViewSchema.shape>;

export default withStandardDecorators(RenamePartialViewTool);