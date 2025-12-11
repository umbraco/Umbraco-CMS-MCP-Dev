import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { CreateMemberTypeRequestModel } from "@/umb-management-api/schemas/index.js";
import { postMemberTypeBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const CreateMemberTypeTool = CreateUmbracoWriteTool(
  "create-member-type",
  "Creates a new member type",
  postMemberTypeBody.shape,
  async (model: CreateMemberTypeRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.postMemberType(model);

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

export default CreateMemberTypeTool;
