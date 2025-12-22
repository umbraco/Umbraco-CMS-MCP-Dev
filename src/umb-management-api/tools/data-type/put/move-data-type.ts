import { MoveDataTypeRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  putDataTypeByIdMoveParams,
  putDataTypeByIdMoveBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidOperation, FULL_RESPONSE_OPTIONS } from "@/helpers/mcp/tool-decorators.js";

const moveDataTypeSchema = {
  id: putDataTypeByIdMoveParams.shape.id,
  body: z.object(putDataTypeByIdMoveBody.shape),
};

const MoveDataTypeTool = {
  name: "move-data-type",
  description: "Move a data type by Id",
  inputSchema: moveDataTypeSchema,
  slices: ['move'],
  handler: (async ({ id, body }: { id: string; body: MoveDataTypeRequestModel }) => {
    return executeVoidOperation((client) => 
      client.putDataTypeByIdMove(id, body, FULL_RESPONSE_OPTIONS)
    );
  }),
} satisfies ToolDefinition<typeof moveDataTypeSchema>;

export default withStandardDecorators(MoveDataTypeTool);
