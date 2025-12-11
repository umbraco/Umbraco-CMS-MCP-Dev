import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { GetFilterMemberParams } from "@/umb-management-api/schemas/index.js";
import { getFilterMemberQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const FindMemberTool = CreateUmbracoReadTool(
  "find-member",
  `Finds members by various filter criteria`,
  getFilterMemberQueryParams.shape,
  async (model: GetFilterMemberParams) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getFilterMember(model);

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

export default FindMemberTool;
