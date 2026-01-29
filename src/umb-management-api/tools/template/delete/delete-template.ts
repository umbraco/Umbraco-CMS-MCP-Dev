import { deleteTemplateByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const DeleteTemplateTool = {
  name: "delete-template",
  description: "Deletes a template by Id",
  inputSchema: deleteTemplateByIdParams.shape,
  annotations: {
    destructiveHint: true,
  },
  slices: ['delete'],
  handler: (async ({ id }: { id: string }) => {
    return executeVoidApiCall((client) =>
      client.deleteTemplateById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof deleteTemplateByIdParams.shape>;

export default withStandardDecorators(DeleteTemplateTool);
