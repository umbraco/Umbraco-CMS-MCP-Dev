import { MoveDictionaryRequestModel } from "@/umb-management-api/schemas/moveDictionaryRequestModel.js";
import {
  putDictionaryByIdMoveParams,
  putDictionaryByIdMoveBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";
import {
  emptyOutputShape,
  executeVoidApiCallWithEmptyOutput,
  type EmptyOutputShape,
} from "../../shared/execute-void-with-empty-output.js";

const moveDictionaryItemSchema = {
  id: putDictionaryByIdMoveParams.shape.id,
  data: z.object(putDictionaryByIdMoveBody.shape),
};

const MoveDictionaryItemTool = {
  name: "move-dictionary-item",
  description: "Moves a dictionary item by Id",
  inputSchema: moveDictionaryItemSchema,
  outputSchema: emptyOutputShape,
  annotations: {
    idempotentHint: true,
  },
  slices: ['move'],
  handler: (async (model: { id: string; data: MoveDictionaryRequestModel }) => {
    return executeVoidApiCallWithEmptyOutput((client) =>
      client.putDictionaryByIdMove(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof moveDictionaryItemSchema, EmptyOutputShape>;

export default withStandardDecorators(MoveDictionaryItemTool);
