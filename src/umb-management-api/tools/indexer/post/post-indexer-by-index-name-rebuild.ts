import { UmbracoManagementClient } from "@umb-management-client";
import { postIndexerByIndexNameRebuildParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const PostIndexerByIndexNameRebuildTool = {
  name: "post-indexer-by-index-name-rebuild",
  description: `Rebuilds a specific index by name.
  This operation will trigger a full rebuild of the index, which may take some time depending on the amount of content.
  Use this only when asked to by the user.`,
  schema: postIndexerByIndexNameRebuildParams.shape,
  isReadOnly: false,
  slices: ['diagnostics'],
  handler: async (model: { indexName: string }) => {
    const client = UmbracoManagementClient.getClient();
    await client.postIndexerByIndexNameRebuild(model.indexName);

    return {
      content: [
        {
          type: "text" as const,
          text: `Index rebuild initiated for: ${model.indexName}`,
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof postIndexerByIndexNameRebuildParams.shape>;

export default withStandardDecorators(PostIndexerByIndexNameRebuildTool);