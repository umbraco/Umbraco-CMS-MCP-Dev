import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { postDocumentValidateBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";

const ValidateDocumentTool = CreateUmbracoReadTool(
  "validate-document",
  "Validates a create document model, using the Umbraco API.",
  postDocumentValidateBody.shape,
  async (model) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postDocumentValidate(model);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
  (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Create)
);

export default ValidateDocumentTool;
