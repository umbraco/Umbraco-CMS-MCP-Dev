import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";

const GetMediaTypeConfigurationTool = CreateUmbracoReadTool(
  "get-media-type-configuration",
  "Gets the configuration for media types",
  {},
  async () => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getMediaTypeConfiguration();

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

export default GetMediaTypeConfigurationTool;
