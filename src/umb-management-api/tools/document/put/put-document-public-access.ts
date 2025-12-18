import { UmbracoManagementClient } from "@umb-management-client";
import {
  putDocumentByIdPublicAccessParams,
  putDocumentByIdPublicAccessBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const putDocumentPublicAccessSchema = {
  id: putDocumentByIdPublicAccessParams.shape.id,
  data: z.object(putDocumentByIdPublicAccessBody.shape),
};

const PutDocumentPublicAccessTool = {
  name: "put-document-public-access",
  description: "Updates public access settings for a document by Id.",
  schema: putDocumentPublicAccessSchema,
  isReadOnly: false,
  slices: ['public-access'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.PublicAccess),
  handler: async (model: { id: string; data: any }) => {
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
} satisfies ToolDefinition<typeof putDocumentPublicAccessSchema>;

export default withStandardDecorators(PutDocumentPublicAccessTool);
