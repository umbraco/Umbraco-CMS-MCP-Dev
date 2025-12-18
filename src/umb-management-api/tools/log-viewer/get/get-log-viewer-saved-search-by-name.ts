import { UmbracoManagementClient } from "@umb-management-client";
import { getLogViewerSavedSearchByNameParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetLogViewerSavedSearchByNameTool = {
  name: "get-log-viewer-saved-search-by-name",
  description: "Gets a saved search by name",
  schema: getLogViewerSavedSearchByNameParams.shape,
  isReadOnly: true,
  slices: ['diagnostics'],
  handler: async ({ name }: { name: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getLogViewerSavedSearchByName(name);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof getLogViewerSavedSearchByNameParams.shape>;

export default withStandardDecorators(GetLogViewerSavedSearchByNameTool);
