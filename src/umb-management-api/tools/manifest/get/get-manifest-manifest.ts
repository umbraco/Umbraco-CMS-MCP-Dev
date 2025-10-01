import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";

const GetManifestManifestTool = CreateUmbracoTool(
  "get-manifest-manifest",
  "Gets all manifests (both public and private) from the Umbraco installation. Each manifest contains an extensions property showing what the package exposes to Umbraco. Use to see which packages are installed, troubleshoot package issues, or list available extensions.",
  {},
  async () => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getManifestManifest();

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

export default GetManifestManifestTool;