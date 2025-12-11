import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getMediaByIdReferencedDescendantsParams, getMediaByIdReferencedDescendantsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";

const GetMediaByIdReferencedDescendantsTool = CreateUmbracoReadTool(
  "get-media-by-id-referenced-descendants",
  `Get descendant references for a media item
  Use this to find all descendant references (child items) that are being referenced for a specific media item.

  Useful for:
  • Impact analysis: Before deleting a media folder, see what content would be affected
  • Dependency tracking: Find all content using media from a specific folder hierarchy
  • Content auditing: Identify which descendant media items are actually being used`,
  z.object({
    ...getMediaByIdReferencedDescendantsParams.shape,
    ...getMediaByIdReferencedDescendantsQueryParams.shape,
  }).shape,
  async ({ id, skip, take }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getMediaByIdReferencedDescendants(id, { skip, take });
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

export default GetMediaByIdReferencedDescendantsTool;