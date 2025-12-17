import { UmbracoManagementClient } from "@umb-management-client";
import {
  getDocumentByIdAuditLogParams,
  getDocumentByIdAuditLogQueryParams,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";

const GetDocumentAuditLogTool = {
  name: "get-document-audit-log",
  description: "Fetches the audit log for a document by Id.",
  schema: {
    id: getDocumentByIdAuditLogParams.shape.id,
    data: z.object(getDocumentByIdAuditLogQueryParams.shape),
  },
  isReadOnly: true,
  slices: ['audit'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Read),
  handler: async (model: { id: string; data: any }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentByIdAuditLog(model.id, model.data);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<{
  id: typeof getDocumentByIdAuditLogParams.shape.id;
  data: ReturnType<typeof z.object<typeof getDocumentByIdAuditLogQueryParams.shape>>;
}>;

export default withStandardDecorators(GetDocumentAuditLogTool);
