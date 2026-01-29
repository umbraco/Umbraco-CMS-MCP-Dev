import { UpdateDataTypeRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  putDataTypeByIdBody,
  putDataTypeByIdParams,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

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
    return executeVoidApiCall((client) => 
      client.putDataTypeById(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof updateDataTypeSchema>;

export default withStandardDecorators(UpdateDataTypeTool);
