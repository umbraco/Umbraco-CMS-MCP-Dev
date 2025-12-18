import { UmbracoManagementClient } from "@umb-management-client";
import { putRecycleBinMediaByIdRestoreParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const RestoreFromRecycleBinTool = {
  name: "restore-media-from-recycle-bin",
  description: "Restores a media item from the recycle bin.",
  schema: putRecycleBinMediaByIdRestoreParams.shape,
  isReadOnly: false,
  slices: ['move', 'recycle-bin'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putRecycleBinMediaByIdRestore(id, {
      target: null,
    });
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof putRecycleBinMediaByIdRestoreParams.shape>;

export default withStandardDecorators(RestoreFromRecycleBinTool);
