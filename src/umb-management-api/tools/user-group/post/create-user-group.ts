import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { CreateUserGroupRequestModel } from "@/umb-management-api/schemas/index.js";
import { postUserGroupBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const CreateUserGroupTool = CreateUmbracoWriteTool(
  "create-user-group",
  "Creates a new user group",
  postUserGroupBody.shape,
  async (model: CreateUserGroupRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.postUserGroup(model);

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

export default CreateUserGroupTool;
