import { MoveDataTypeRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  putDataTypeByIdMoveParams,
  putDataTypeByIdMoveBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

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
    return executeVoidApiCall((client) => 
      client.putDataTypeByIdMove(id, body, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof moveDataTypeSchema>;

export default withStandardDecorators(MoveDataTypeTool);
