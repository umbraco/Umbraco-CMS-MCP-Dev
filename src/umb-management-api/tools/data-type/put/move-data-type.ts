import { UmbracoManagementClient } from "@umb-management-client";
import { MoveDataTypeRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  putDataTypeByIdMoveParams,
  putDataTypeByIdMoveBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const moveDataTypeSchema = {
  id: putDataTypeByIdMoveParams.shape.id,
  body: z.object(putDataTypeByIdMoveBody.shape),
};

const MoveDataTypeTool = {
  name: "move-data-type",
  description: "Move a data type by Id",
  schema: moveDataTypeSchema,
  isReadOnly: false,
  slices: ['move'],
  handler: async ({ id, body }: { id: string; body: MoveDataTypeRequestModel }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putDataTypeByIdMove(id, body);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof moveDataTypeSchema>;

export default withStandardDecorators(MoveDataTypeTool);
