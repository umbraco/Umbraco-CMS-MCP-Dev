import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const emptySchema = z.object({});

const GetMediaTypeConfigurationTool = {
  name: "get-media-type-configuration",
  description: "Gets the configuration for media types",
  schema: emptySchema.shape,
  isReadOnly: true,
  slices: ['configuration'],
  handler: async () => {
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
  },
} satisfies ToolDefinition<typeof emptySchema.shape>;

export default withStandardDecorators(GetMediaTypeConfigurationTool);
