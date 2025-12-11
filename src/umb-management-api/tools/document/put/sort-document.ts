import { UmbracoManagementClient } from "@umb-management-client";
import { putDocumentSortBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";

const SortDocumentTool = CreateUmbracoWriteTool(
  "sort-document",
  "Sorts the order of documents under a parent.",
  putDocumentSortBody.shape,
  async (model: any) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putDocumentSort(model);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
  (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Sort)
);

export default SortDocumentTool;
