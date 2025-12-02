import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { GetMemberGroupParams } from "@/umb-management-api/schemas/index.js";
import { getMemberGroupQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetAllMemberGroupsTool = CreateUmbracoTool(
  "get-all-member-groups",
  `Gets all member groups with optional pagination`,
  getMemberGroupQueryParams.shape,
  async (model: GetMemberGroupParams) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getMemberGroup(model);

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

export default GetAllMemberGroupsTool;
