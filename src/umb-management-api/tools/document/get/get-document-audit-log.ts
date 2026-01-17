import {
  getDocumentByIdAuditLogParams,
  getDocumentByIdAuditLogQueryParams,
  getDocumentByIdAuditLogResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const inputSchema = {
  id: getDocumentByIdAuditLogParams.shape.id,
  data: z.object(getDocumentByIdAuditLogQueryParams.shape),
};

const GetDocumentAuditLogTool = {
  name: "get-document-audit-log",
  description: "Fetches the audit log for a document by Id.",
  inputSchema: inputSchema,
  outputSchema: getDocumentByIdAuditLogResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['audit'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Read),
  handler: (async (model: { id: string; data: any }) => {
    return executeGetApiCall((client) =>
      client.getDocumentByIdAuditLog(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema, typeof getDocumentByIdAuditLogResponse.shape>;

export default withStandardDecorators(GetDocumentAuditLogTool);
