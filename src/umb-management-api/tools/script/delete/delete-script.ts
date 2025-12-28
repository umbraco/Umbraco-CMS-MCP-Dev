import { UmbracoManagementClient } from "@umb-management-client";
import { deleteScriptByPathParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const DeleteScriptTool = {
  name: "delete-script",
  description: "Deletes a script by path",
  schema: deleteScriptByPathParams.shape,
  isReadOnly: false,
  slices: ['delete'],
  handler: async ({ path }: { path: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.deleteScriptByPath(path);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof deleteScriptByPathParams.shape>;

export default withStandardDecorators(DeleteScriptTool);