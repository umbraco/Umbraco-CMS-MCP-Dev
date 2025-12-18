import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetManifestManifestTool = {
  name: "get-manifest-manifest",
  description: "Gets all manifests (both public and private) from the Umbraco installation. Each manifest contains an extensions property showing what the package exposes to Umbraco. Use to see which packages are installed, troubleshoot package issues, or list available extensions.",
  schema: {},
  isReadOnly: true,
  slices: ['read'],
  handler: async () => {
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
} satisfies ToolDefinition<{}>;

export default withStandardDecorators(GetManifestManifestTool);