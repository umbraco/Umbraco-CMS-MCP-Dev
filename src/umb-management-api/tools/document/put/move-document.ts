import { UmbracoManagementClient } from "@umb-management-client";
import { putDocumentByIdMoveBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const moveDocumentSchema = {
  id: z.string().uuid(),
  data: z.object(putDocumentByIdMoveBody.shape),
};

const MoveDocumentTool = {
  name: "move-document",
  description: "Move a document to a new location",
  schema: moveDocumentSchema,
  isReadOnly: false,
  slices: ['move'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Move),
  handler: async (model: { id: string; data: any }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putDocumentByIdMove(model.id, model.data);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof moveDocumentSchema>;

export default withStandardDecorators(MoveDocumentTool);
