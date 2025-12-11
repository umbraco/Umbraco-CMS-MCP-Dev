import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { putDocumentByIdUnpublishBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";

const UnpublishDocumentTool = CreateUmbracoWriteTool(
  "unpublish-document",
  "Unpublishes a document by Id.",
  {
    id: z.string().uuid(),
    data: z.object(putDocumentByIdUnpublishBody.shape),
  },
  async (model: {
    id: string;
    data: z.infer<typeof putDocumentByIdUnpublishBody>;
  }) => {
    const client = UmbracoManagementClient.getClient();
    if (!model.data.cultures) model.data.cultures = null;
    const response = await client.putDocumentByIdUnpublish(
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
  (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Unpublish)
);

export default UnpublishDocumentTool;
