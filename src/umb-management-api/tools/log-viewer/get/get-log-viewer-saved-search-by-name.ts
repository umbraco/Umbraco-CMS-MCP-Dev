import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/create-umbraco-tool.js";
import { getLogViewerSavedSearchByNameParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetLogViewerSavedSearchByNameTool = CreateUmbracoTool(
  "get-log-viewer-saved-search-by-name",
  "Gets a saved search by name",
  getLogViewerSavedSearchByNameParams.shape,
  async ({ name }) => {
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
);

export default GetLogViewerSavedSearchByNameTool;
