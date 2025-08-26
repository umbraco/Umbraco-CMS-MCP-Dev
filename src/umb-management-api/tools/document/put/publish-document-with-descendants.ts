import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/create-umbraco-tool.js";
import { putDocumentByIdPublishWithDescendantsBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";

const PublishDocumentWithDescendantsTool = CreateUmbracoTool(
  "publish-document-with-descendants",
  "Publishes a document and its descendants by Id.",
  {
    id: z.string().uuid(),
    data: z.object(putDocumentByIdPublishWithDescendantsBody.shape),
  },
  async (model: { id: string; data: any }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putDocumentByIdPublishWithDescendants(
      model.id,
      model.data
    );
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
  (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Publish)
);

export default PublishDocumentWithDescendantsTool;
