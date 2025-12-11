import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getMemberAreReferencedQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetMemberAreReferencedTool = CreateUmbracoReadTool(
  "get-member-are-referenced",
  `Check if member accounts are referenced
  Use this to verify if specific member accounts are being referenced by content.`,
  getMemberAreReferencedQueryParams.shape,
  async ({ id, skip, take }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getMemberAreReferenced({ id, skip, take });
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

export default GetMemberAreReferencedTool;