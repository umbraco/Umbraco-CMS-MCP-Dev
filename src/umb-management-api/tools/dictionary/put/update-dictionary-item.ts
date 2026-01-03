import { UpdateDictionaryItemRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  putDictionaryByIdBody,
  putDictionaryByIdParams,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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
