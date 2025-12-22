import { UpdateDataTypeRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  putDataTypeByIdBody,
  putDataTypeByIdParams,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidOperation, FULL_RESPONSE_OPTIONS } from "@/helpers/mcp/tool-decorators.js";

const updateDataTypeSchema = {
  id: putDataTypeByIdParams.shape.id,
  data: z.object(putDataTypeByIdBody.shape),
};

const UpdateDataTypeTool = {
  name: "update-data-type",
  description: "Updates a data type by Id",
  inputSchema: updateDataTypeSchema,
  annotations: {
    idempotentHint: true,
  },
  slices: ['update'],
  handler: (async (model: { id: string; data: UpdateDataTypeRequestModel }) => {
    return executeVoidOperation((client) => 
      client.putDataTypeById(model.id, model.data, FULL_RESPONSE_OPTIONS)
    );
  }),
} satisfies ToolDefinition<typeof updateDataTypeSchema>;

export default withStandardDecorators(UpdateDataTypeTool);
