import { UmbracoManagementClient } from "@umb-management-client";
import { UpdateDictionaryItemRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  putDictionaryByIdBody,
  putDictionaryByIdParams,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const updateDictionaryItemSchema = {
  id: putDictionaryByIdParams.shape.id,
  data: z.object(putDictionaryByIdBody.shape),
};

const UpdateDictionaryItemTool = {
  name: "update-dictionary-item",
  description: "Updates a dictionary item by Id",
  schema: updateDictionaryItemSchema,
  isReadOnly: false,
  slices: ['update'],
  handler: async (model: { id: string; data: UpdateDictionaryItemRequestModel }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putDictionaryById(model.id, model.data);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof updateDictionaryItemSchema>;

export default withStandardDecorators(UpdateDictionaryItemTool);
