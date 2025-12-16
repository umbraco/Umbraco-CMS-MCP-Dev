import { UmbracoManagementClient } from "@umb-management-client";
import { MoveDocumentBlueprintRequestModel } from "@/umb-management-api/schemas/moveDocumentBlueprintRequestModel.js";
import {
  putDocumentBlueprintByIdMoveParams,
  putDocumentBlueprintByIdMoveBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const moveDocumentBlueprintSchema = {
  id: putDocumentBlueprintByIdMoveParams.shape.id,
  data: z.object(putDocumentBlueprintByIdMoveBody.shape),
};

const MoveDocumentBlueprintTool = {
  name: "move-document-blueprint",
  description: "Moves a document blueprint by Id",
  schema: moveDocumentBlueprintSchema,
  isReadOnly: false,
  slices: ['move'],
  handler: async (model: { id: string; data: MoveDocumentBlueprintRequestModel }) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.putDocumentBlueprintByIdMove(
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
} satisfies ToolDefinition<typeof moveDocumentBlueprintSchema>;

export default withStandardDecorators(MoveDocumentBlueprintTool);
