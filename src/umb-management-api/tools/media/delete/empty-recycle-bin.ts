import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const EmptyRecycleBinTool = {
  name: "empty-media-recycle-bin",
  description: "Empties the media recycle bin.",
  schema: {},
  isReadOnly: false,
  slices: ['delete', 'recycle-bin'],
  handler: async () => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.deleteRecycleBinMedia();
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

export default withStandardDecorators(EmptyRecycleBinTool);
