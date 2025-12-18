import { UmbracoManagementClient } from "@umb-management-client";
import { deleteLogViewerSavedSearchByNameParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const DeleteLogViewerSavedSearchByNameTool = {
  name: "delete-log-viewer-saved-search-by-name",
  description: "Deletes a saved search by name",
  schema: deleteLogViewerSavedSearchByNameParams.shape,
  isReadOnly: false,
  slices: ['diagnostics'],
  handler: async ({ name }: { name: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.deleteLogViewerSavedSearchByName(name);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof deleteLogViewerSavedSearchByNameParams.shape>;

export default withStandardDecorators(DeleteLogViewerSavedSearchByNameTool);
