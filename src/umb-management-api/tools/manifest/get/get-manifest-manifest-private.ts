import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetManifestManifestPrivateTool = {
  name: "get-manifest-manifest-private",
  description: "Gets private manifests from the Umbraco installation. Private manifests require authentication and contain administrative/sensitive extensions.",
  schema: {},
  isReadOnly: true,
  slices: ['read'],
  handler: async () => {
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
} satisfies ToolDefinition<{}>;

export default withStandardDecorators(GetManifestManifestPrivateTool);