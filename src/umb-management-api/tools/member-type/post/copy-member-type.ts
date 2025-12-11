import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { z } from "zod";

const CopyMemberTypeTool = CreateUmbracoWriteTool(
  "copy-member-type",
  "Copy a member type to a new location",
  {
    id: z.string().uuid(),
  },
  async (model: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postMemberTypeByIdCopy(model.id);

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

export default CopyMemberTypeTool;
