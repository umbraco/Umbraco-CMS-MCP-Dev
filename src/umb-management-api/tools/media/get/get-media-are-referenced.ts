import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getMediaAreReferencedQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetMediaAreReferencedTool = CreateUmbracoReadTool(
  "get-media-are-referenced",
  `Check if media items are referenced
  Use this to verify if specific media items are being referenced by other content before deletion or modification.`,
  getMediaAreReferencedQueryParams.shape,
  async ({ id, skip, take }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getMediaAreReferenced({ id, skip, take });
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
);

export default GetMediaAreReferencedTool;