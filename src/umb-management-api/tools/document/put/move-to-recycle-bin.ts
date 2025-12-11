import { UmbracoManagementClient } from "@umb-management-client";
import { putDocumentByIdMoveToRecycleBinParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";

const MoveDocumentToRecycleBinTool = CreateUmbracoWriteTool(
  "move-document-to-recycle-bin",
  "Move a document to the recycle bin",
  putDocumentByIdMoveToRecycleBinParams.shape,
  async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putDocumentByIdMoveToRecycleBin(id);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
  (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Delete)
);

export default MoveDocumentToRecycleBinTool;
