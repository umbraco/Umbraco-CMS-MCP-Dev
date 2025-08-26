import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/create-umbraco-tool.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";

const EmptyRecycleBinTool = CreateUmbracoTool(
  "empty-recycle-bin",
  "Empties the document recycle bin.",
  {},
  async () => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.deleteRecycleBinDocument();
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

export default EmptyRecycleBinTool;
