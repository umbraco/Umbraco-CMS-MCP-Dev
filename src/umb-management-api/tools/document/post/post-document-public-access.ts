import { UmbracoManagementClient } from "@umb-management-client";
import {
  postDocumentByIdPublicAccessParams,
  postDocumentByIdPublicAccessBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";

const PostDocumentPublicAccessTool = {
  name: "post-document-public-access",
  description: "Adds public access settings to a document by Id.",
  schema: {
    id: postDocumentByIdPublicAccessParams.shape.id,
    data: z.object(postDocumentByIdPublicAccessBody.shape),
  },
  isReadOnly: false,
  slices: ['public-access'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.PublicAccess),
  handler: async (model: { id: string; data: any }) => {
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
} satisfies ToolDefinition<{
  id: typeof postDocumentByIdPublicAccessParams.shape.id;
  data: ReturnType<typeof z.object<typeof postDocumentByIdPublicAccessBody.shape>>;
}>;

export default withStandardDecorators(PostDocumentPublicAccessTool);
