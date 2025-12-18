import { UmbracoManagementClient } from "@umb-management-client";
import { UpdateDataTypeRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  putDataTypeByIdBody,
  putDataTypeByIdParams,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const updateDataTypeSchema = {
  id: putDataTypeByIdParams.shape.id,
  data: z.object(putDataTypeByIdBody.shape),
};

const UpdateDataTypeTool = {
  name: "update-data-type",
  description: "Updates a data type by Id",
  schema: updateDataTypeSchema,
  isReadOnly: false,
  slices: ['update'],
  handler: async (model: { id: string; data: UpdateDataTypeRequestModel }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putDataTypeById(model.id, model.data);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof updateDataTypeSchema>;

export default withStandardDecorators(UpdateDataTypeTool);
