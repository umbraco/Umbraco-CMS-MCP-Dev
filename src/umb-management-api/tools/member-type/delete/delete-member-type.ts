import { deleteMemberTypeByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const DeleteMemberTypeTool = {
  name: "delete-member-type",
  description: "Deletes a member type by id",
  inputSchema: deleteMemberTypeByIdParams.shape,
  annotations: {
    destructiveHint: true,
  },
  slices: ['delete'],
  handler: (async ({ id }: { id: string }) => {
    return executeVoidApiCall((client) =>
      client.deleteMemberTypeById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof deleteMemberTypeByIdParams.shape>;

export default withStandardDecorators(DeleteMemberTypeTool);
