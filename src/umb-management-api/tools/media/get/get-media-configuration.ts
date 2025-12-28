import { UmbracoManagementClient } from "@umb-management-client";
import { getMediaConfigurationResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetMediaConfigurationTool = {
  name: "get-media-configuration",
  description: "Gets the media configuration for the Umbraco instance.",
  schema: {},
  isReadOnly: true,
  slices: ['configuration'],
  handler: async () => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getMediaConfiguration();
    // Optionally validate response
    getMediaConfigurationResponse.parse(response);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<{}>;

export default withStandardDecorators(GetMediaConfigurationTool);
