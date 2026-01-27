import { UpdateDictionaryItemRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  putDictionaryByIdBody,
  putDictionaryByIdParams,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const updateDictionaryItemSchema = {
  id: putDictionaryByIdParams.shape.id,
  data: z.object(putDictionaryByIdBody.shape),
};

const UpdateDictionaryItemTool = {
  name: "update-dictionary-item",
  description: "Updates a dictionary item by Id",
  inputSchema: updateDictionaryItemSchema,
  annotations: {
    idempotentHint: true,
  },
  slices: ['update'],
  handler: (async (model: { id: string; data: UpdateDictionaryItemRequestModel }) => {
    return executeVoidApiCall((client) =>
      client.putDictionaryById(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof updateDictionaryItemSchema>;

export default withStandardDecorators(UpdateDictionaryItemTool);
