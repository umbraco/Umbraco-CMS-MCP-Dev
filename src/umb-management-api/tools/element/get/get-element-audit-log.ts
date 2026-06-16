import {
  getElementByIdAuditLogParams,
  getElementByIdAuditLogQueryParams,
  getElementByIdAuditLogResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoElementPermissions } from "../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const inputSchema = {
  id: getElementByIdAuditLogParams.shape.id,
  ...getElementByIdAuditLogQueryParams.shape,
};

const GetElementAuditLogTool = {
  name: "get-element-audit-log",
  description: "Fetches the audit log for an element by Id.",
  inputSchema: inputSchema,
  outputSchema: getElementByIdAuditLogResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['audit'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoElementPermissions.Read),
  handler: (async (model: { id: string; orderDirection?: string; sinceDate?: string; skip?: number; take?: number }) => {
    const { id, ...queryParams } = model;
    return executeGetApiCall((client) =>
      client.getElementByIdAuditLog(id, queryParams, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema, typeof getElementByIdAuditLogResponse.shape>;

export default withStandardDecorators(GetElementAuditLogTool);
