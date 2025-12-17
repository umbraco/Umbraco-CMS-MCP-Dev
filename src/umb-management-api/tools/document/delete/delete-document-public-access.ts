import { UmbracoManagementClient } from "@umb-management-client";
import { deleteDocumentByIdPublicAccessParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";

const DeleteDocumentPublicAccessTool = {
  name: "delete-document-public-access",
  description: "Removes public access settings from a document by Id.",
  schema: deleteDocumentByIdPublicAccessParams.shape,
  isReadOnly: false,
  slices: ['public-access'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.PublicAccess),
  handler: async ({ id }: { id: string }) => {
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
} satisfies ToolDefinition<typeof deleteDocumentByIdPublicAccessParams.shape>;

export default withStandardDecorators(DeleteDocumentPublicAccessTool);
