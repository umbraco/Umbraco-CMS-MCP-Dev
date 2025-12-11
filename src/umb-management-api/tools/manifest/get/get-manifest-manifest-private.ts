import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";

const GetManifestManifestPrivateTool = CreateUmbracoReadTool(
  "get-manifest-manifest-private",
  "Gets private manifests from the Umbraco installation. Private manifests require authentication and contain administrative/sensitive extensions.",
  {},
  async () => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getManifestManifestPrivate();

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

export default GetManifestManifestPrivateTool;