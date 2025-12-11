import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import {
  putDocumentByIdPublicAccessParams,
  putDocumentByIdPublicAccessBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";

const PutDocumentPublicAccessTool = CreateUmbracoWriteTool(
  "put-document-public-access",
  "Updates public access settings for a document by Id.",
  {
    id: putDocumentByIdPublicAccessParams.shape.id,
    data: z.object(putDocumentByIdPublicAccessBody.shape),
  }, async (model: { id: string; data: any }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putDocumentByIdPublicAccess(
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
  (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.PublicAccess)
);

export default PutDocumentPublicAccessTool;
