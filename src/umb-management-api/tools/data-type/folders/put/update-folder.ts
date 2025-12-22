import {
  putDataTypeFolderByIdParams,
  putDataTypeFolderByIdBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidOperation, FULL_RESPONSE_OPTIONS } from "@/helpers/mcp/tool-decorators.js";

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
    return executeVoidOperation((client) => 
      client.putDataTypeFolderById(model.id, model.data, FULL_RESPONSE_OPTIONS)
    );
  }),
} satisfies ToolDefinition<typeof updateDataTypeFolderSchema>;

export default withStandardDecorators(UpdateDataTypeFolderTool);
