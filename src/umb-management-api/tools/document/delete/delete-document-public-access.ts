import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { deleteDocumentByIdPublicAccessParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";

const DeleteDocumentPublicAccessTool = CreateUmbracoWriteTool(
  "delete-document-public-access",
  "Removes public access settings from a document by Id.",
  deleteDocumentByIdPublicAccessParams.shape,
  async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.deleteDocumentByIdPublicAccess(id);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
  (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.PublicAccess)
);

export default DeleteDocumentPublicAccessTool;
