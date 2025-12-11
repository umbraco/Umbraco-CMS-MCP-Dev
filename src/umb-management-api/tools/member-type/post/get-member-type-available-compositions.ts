import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { postMemberTypeAvailableCompositionsBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetMemberTypeAvailableCompositionsTool = CreateUmbracoReadTool(
  "get-member-type-available-compositions",
  "Gets the available compositions for a member type",
  postMemberTypeAvailableCompositionsBody.shape,
  async (model) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postMemberTypeAvailableCompositions(model);

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

export default GetMemberTypeAvailableCompositionsTool;
