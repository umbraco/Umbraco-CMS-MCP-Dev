import { getTemplateByIdParams, getTemplateByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetTemplateTool = {
  name: "get-template",
  description: "Gets a template by Id",
  inputSchema: getTemplateByIdParams.shape,
  outputSchema: getTemplateByIdResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getTemplateById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTemplateByIdParams.shape, typeof getTemplateByIdResponse.shape>;

export default withStandardDecorators(GetTemplateTool);
