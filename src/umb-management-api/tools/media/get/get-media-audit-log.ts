import {
  getMediaByIdAuditLogParams,
  getMediaByIdAuditLogQueryParams,
  getMediaByIdAuditLogResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const inputSchema = {
  id: getMediaByIdAuditLogParams.shape.id,
  ...getMediaByIdAuditLogQueryParams.shape,
};

const GetMediaAuditLogTool = {
  name: "get-media-audit-log",
  description: "Fetches the audit log for a media item by Id.",
  inputSchema,
  outputSchema: getMediaByIdAuditLogResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['audit'],
  handler: (async (model: { id: string; orderDirection?: string; sinceDate?: string; skip?: number; take?: number }) => {
    const { id, ...queryParams } = model;
    return executeGetApiCall((client) =>
      client.getMediaByIdAuditLog(id, queryParams, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema, typeof getMediaByIdAuditLogResponse.shape>;

export default withStandardDecorators(GetMediaAuditLogTool);
