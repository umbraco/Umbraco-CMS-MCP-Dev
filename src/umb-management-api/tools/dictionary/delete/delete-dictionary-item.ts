import { deleteDictionaryByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const DeleteDictionaryItemTool = {
  name: "delete-dictionary-item",
  description: "Deletes a dictionary item by Id",
  inputSchema: deleteDictionaryByIdParams.shape,
  annotations: {
    destructiveHint: true,
  },
  slices: ['delete'],
  handler: (async ({ id }: { id: string }) => {
    return executeVoidApiCall((client) =>
      client.deleteDictionaryById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof deleteDictionaryByIdParams.shape>;

export default withStandardDecorators(DeleteDictionaryItemTool);
