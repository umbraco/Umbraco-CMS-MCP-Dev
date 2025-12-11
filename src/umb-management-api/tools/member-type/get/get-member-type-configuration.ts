import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";

const GetMemberTypeConfigurationTool = CreateUmbracoReadTool(
  "get-member-type-configuration",
  "Gets the configuration for member types",
  {},
  async () => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getMemberTypeConfiguration();

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

export default GetMemberTypeConfigurationTool;
