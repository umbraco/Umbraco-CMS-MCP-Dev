import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";

const GetDocumentTypeConfigurationTool = CreateUmbracoReadTool(
  "get-document-type-configuration",
  "Gets the global configuration for document types",
  {},
  async () => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentTypeConfiguration();
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

export default GetDocumentTypeConfigurationTool;
