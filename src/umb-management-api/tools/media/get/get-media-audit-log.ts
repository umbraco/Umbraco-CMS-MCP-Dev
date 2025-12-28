import { UmbracoManagementClient } from "@umb-management-client";
import {
  getMediaByIdAuditLogParams,
  getMediaByIdAuditLogQueryParams,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const schema = {
  id: getMediaByIdAuditLogParams.shape.id,
  data: z.object(getMediaByIdAuditLogQueryParams.shape),
};

const GetMediaAuditLogTool = {
  name: "get-media-audit-log",
  description: "Fetches the audit log for a media item by Id.",
  schema,
  isReadOnly: true,
  slices: ['audit'],
  handler: async (model: { id: string; data: any }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getMediaByIdAuditLog(model.id, model.data);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof schema>;

export default withStandardDecorators(GetMediaAuditLogTool);
