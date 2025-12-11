import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { CreateMemberGroupRequestModel } from "@/umb-management-api/schemas/index.js";
import { postMemberGroupBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const CreateMemberGroupTool = CreateUmbracoWriteTool(
  "create-member-group",
  "Creates a new member group",
  postMemberGroupBody.shape,
  async (model: CreateMemberGroupRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.postMemberGroup(model);

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

export default CreateMemberGroupTool;
