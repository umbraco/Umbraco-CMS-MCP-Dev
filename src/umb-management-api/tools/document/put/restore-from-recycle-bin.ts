import { UmbracoManagementClient } from "@umb-management-client";
import { putRecycleBinDocumentByIdRestoreParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const RestoreFromRecycleBinTool = {
  name: "restore-document-from-recycle-bin",
  description: "Restores a document from the recycle bin.",
  schema: putRecycleBinDocumentByIdRestoreParams.shape,
  isReadOnly: false,
  slices: ['move','recycle-bin'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Delete),
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putRecycleBinDocumentByIdRestore(id, {
      target: null,
    });
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof putRecycleBinDocumentByIdRestoreParams.shape>;

export default withStandardDecorators(RestoreFromRecycleBinTool);
