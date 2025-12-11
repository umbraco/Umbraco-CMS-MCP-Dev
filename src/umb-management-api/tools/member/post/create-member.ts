import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { postMemberBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const CreateMemberTool = CreateUmbracoWriteTool(
  "create-member",
  `Creates a member in Umbraco.
  Use this endpoint to create new members with the specified properties and groups.`,
  postMemberBody.shape,
  async (model) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postMember(model);
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

export default CreateMemberTool;
