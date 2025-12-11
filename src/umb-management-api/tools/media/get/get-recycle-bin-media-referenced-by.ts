import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getRecycleBinMediaReferencedByQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";

const GetRecycleBinMediaReferencedByTool = CreateUmbracoReadTool(
  "get-recycle-bin-media-referenced-by",
  `Get references to deleted media items in the recycle bin
  Use this to find content that still references deleted media items before permanently deleting them.`,
  getRecycleBinMediaReferencedByQueryParams.shape,
  async ({ skip, take }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getRecycleBinMediaReferencedBy({ skip, take });
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

export default GetRecycleBinMediaReferencedByTool;