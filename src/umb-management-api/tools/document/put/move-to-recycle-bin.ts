import { UmbracoManagementClient } from "@umb-management-client";
import { putDocumentByIdMoveToRecycleBinParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const MoveDocumentToRecycleBinTool = {
  name: "move-document-to-recycle-bin",
  description: "Move a document to the recycle bin",
  schema: putDocumentByIdMoveToRecycleBinParams.shape,
  isReadOnly: false,
  slices: ['move', 'recycle-bin'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Delete),
  handler: async ({ id }: { id: string }) => {
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
} satisfies ToolDefinition<typeof putDocumentByIdMoveToRecycleBinParams.shape>;

export default withStandardDecorators(MoveDocumentToRecycleBinTool);
