import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { postIndexerByIndexNameRebuildParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const PostIndexerByIndexNameRebuildTool = CreateUmbracoTool(
  "post-indexer-by-index-name-rebuild",
  `Rebuilds a specific index by name.
  This operation will trigger a full rebuild of the index, which may take some time depending on the amount of content.
  Use this only when asked to by the user.`,
  postIndexerByIndexNameRebuildParams.shape,
  async (model: { indexName: string }) => {
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
  }
);

export default PostIndexerByIndexNameRebuildTool;