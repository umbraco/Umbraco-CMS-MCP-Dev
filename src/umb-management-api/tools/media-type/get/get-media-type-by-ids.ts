import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getMediaTypeByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";

const GetMediaTypeByIdsTool = CreateUmbracoReadTool(
  "get-media-type-by-ids",
  "Gets media types by ids",
  {
    ids: z.array(z.string()),
  },
  async ({ ids }: { ids: string[] }) => {
    const client = UmbracoManagementClient.getClient();
    const responses = await Promise.all(
      ids.map((id: string) => client.getMediaTypeById(id))
    );

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(responses),
        },
      ],
    };
  }
);

export default GetMediaTypeByIdsTool;
