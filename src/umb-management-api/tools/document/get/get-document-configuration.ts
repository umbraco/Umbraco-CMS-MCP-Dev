import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getDocumentConfigurationResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetDocumentConfigurationTool = CreateUmbracoReadTool(
  "get-document-configuration",
  "Gets the document configuration for the Umbraco instance.",
  {},
  async () => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentConfiguration();

    getDocumentConfigurationResponse.parse(response);
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

export default GetDocumentConfigurationTool;
