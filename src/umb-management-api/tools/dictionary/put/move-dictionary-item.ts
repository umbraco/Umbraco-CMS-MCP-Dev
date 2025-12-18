import { UmbracoManagementClient } from "@umb-management-client";
import { MoveDictionaryRequestModel } from "@/umb-management-api/schemas/moveDictionaryRequestModel.js";
import {
  putDictionaryByIdMoveParams,
  putDictionaryByIdMoveBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const moveDictionaryItemSchema = {
  id: putDictionaryByIdMoveParams.shape.id,
  data: z.object(putDictionaryByIdMoveBody.shape),
};

const MoveDictionaryItemTool = {
  name: "move-dictionary-item",
  description: "Moves a dictionary item by Id",
  schema: moveDictionaryItemSchema,
  isReadOnly: false,
  slices: ['move'],
  handler: async (model: { id: string; data: MoveDictionaryRequestModel }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putDictionaryByIdMove(model.id, model.data);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof moveDictionaryItemSchema>;

export default withStandardDecorators(MoveDictionaryItemTool);
