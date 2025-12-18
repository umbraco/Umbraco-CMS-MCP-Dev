import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { putDocumentTypeByIdMoveBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { MoveDocumentTypeRequestModel } from "@/umb-management-api/schemas/moveDocumentTypeRequestModel.js";
import { z } from "zod";

const moveDocumentTypeSchema = {
  id: z.string().uuid(),
  data: z.object(putDocumentTypeByIdMoveBody.shape),
};

const MoveDocumentTypeTool = {
  name: "move-document-type",
  description: "Move a document type to a new location",
  schema: moveDocumentTypeSchema,
  isReadOnly: false,
  slices: ['move'],
  handler: async (model: { id: string; data: MoveDocumentTypeRequestModel }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putDocumentTypeByIdMove(model.id, model.data);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof moveDocumentTypeSchema>;

export default withStandardDecorators(MoveDocumentTypeTool);
