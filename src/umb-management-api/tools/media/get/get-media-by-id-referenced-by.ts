import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getMediaByIdReferencedByParams, getMediaByIdReferencedByQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";

const GetMediaByIdReferencedByTool = CreateUmbracoTool(
  "get-media-by-id-referenced-by",
  `Get items that reference a specific media item
  Use this to find all content, documents, or other items that are currently referencing a specific media item.`,
  z.object({
    ...getMediaByIdReferencedByParams.shape,
    ...getMediaByIdReferencedByQueryParams.shape,
  }).shape,
  async ({ id, skip, take }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getMediaByIdReferencedBy(id, { skip, take });
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

export default GetMediaByIdReferencedByTool;