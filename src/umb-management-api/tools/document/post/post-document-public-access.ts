import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import {
  postDocumentByIdPublicAccessParams,
  postDocumentByIdPublicAccessBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";

const PostDocumentPublicAccessTool = CreateUmbracoWriteTool(
  "post-document-public-access",
  "Adds public access settings to a document by Id.",
  {
    id: postDocumentByIdPublicAccessParams.shape.id,
    data: z.object(postDocumentByIdPublicAccessBody.shape),
  }, async (model: { id: string; data: any }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postDocumentByIdPublicAccess(
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

export default PostDocumentPublicAccessTool;
