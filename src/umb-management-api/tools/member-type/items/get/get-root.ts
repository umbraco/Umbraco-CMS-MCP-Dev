import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/create-umbraco-tool.js";
import { GetTreeMemberTypeRootParams } from "@/umb-management-api/schemas/index.js";
import { getTreeMemberTypeRootQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetMemberTypeRootTool = CreateUmbracoTool(
  "get-member-type-root",
  "Gets the root level of the member type tree",
  getTreeMemberTypeRootQueryParams.shape,
  async (params: GetTreeMemberTypeRootParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeMemberTypeRoot(params);

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

export default GetMemberTypeRootTool;
