import {
  putDataTypeFolderByIdParams,
  putDataTypeFolderByIdBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const updateDataTypeFolderSchema = {
  id: putDataTypeFolderByIdParams.shape.id,
  data: z.object(putDataTypeFolderByIdBody.shape),
};

const UpdateDataTypeFolderTool = {
  name: "update-data-type-folder",
  description: "Updates a data type folder by Id",
  inputSchema: updateDataTypeFolderSchema,
  annotations: {
    idempotentHint: true,
  },
  slices: ['update', 'folders'],
  handler: (async (model: { id: string; data: { name: string } }) => {
    return executeVoidApiCall((client) => 
      client.putDataTypeFolderById(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof updateDataTypeFolderSchema>;

export default withStandardDecorators(UpdateDataTypeFolderTool);
