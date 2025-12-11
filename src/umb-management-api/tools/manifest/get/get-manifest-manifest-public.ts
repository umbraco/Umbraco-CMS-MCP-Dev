import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";

const GetManifestManifestPublicTool = CreateUmbracoReadTool(
  "get-manifest-manifest-public",
  "Gets public manifests from the Umbraco installation. Public manifests can be accessed without authentication and contain public-facing extensions.",
  {},
  async () => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getManifestManifestPublic();

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

export default GetManifestManifestPublicTool;