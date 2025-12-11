import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { deleteLogViewerSavedSearchByNameParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const DeleteLogViewerSavedSearchByNameTool = CreateUmbracoWriteTool(
  "delete-log-viewer-saved-search-by-name",
  "Deletes a saved search by name",
  deleteLogViewerSavedSearchByNameParams.shape,
  async ({ name }) => {
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
);

export default DeleteLogViewerSavedSearchByNameTool;
