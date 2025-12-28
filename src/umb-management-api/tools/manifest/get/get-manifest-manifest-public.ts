import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetManifestManifestPublicTool = {
  name: "get-manifest-manifest-public",
  description: "Gets public manifests from the Umbraco installation. Public manifests can be accessed without authentication and contain public-facing extensions.",
  schema: {},
  isReadOnly: true,
  slices: ['read'],
  handler: async () => {
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
} satisfies ToolDefinition<{}>;

export default withStandardDecorators(GetManifestManifestPublicTool);