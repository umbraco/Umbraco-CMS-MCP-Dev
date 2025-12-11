import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getMemberTypeByIdCompositionReferencesParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetMemberTypeCompositionReferencesTool = CreateUmbracoReadTool(
  "get-member-type-composition-references",
  "Gets the composition references for a member type",
  getMemberTypeByIdCompositionReferencesParams.shape,
  async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getMemberTypeByIdCompositionReferences(id);

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

export default GetMemberTypeCompositionReferencesTool;
