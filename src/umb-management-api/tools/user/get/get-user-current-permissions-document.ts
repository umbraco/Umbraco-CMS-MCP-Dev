import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getUserCurrentPermissionsDocumentQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetUserCurrentPermissionsDocumentTool = CreateUmbracoReadTool(
  "get-user-current-permissions-document",
  "Gets the current user's document permissions for specific documents",
  getUserCurrentPermissionsDocumentQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getUserCurrentPermissionsDocument(params);

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

export default GetUserCurrentPermissionsDocumentTool;