import { deleteMemberGroupByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
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

const DeleteMemberGroupTool = {
  name: "delete-member-group",
  description: "Deletes a member group by Id",
  inputSchema: deleteMemberGroupByIdParams.shape,
  outputSchema: emptyOutputShape,
  annotations: {
    destructiveHint: true,
  },
  slices: ['delete'],
  handler: (async ({ id }: { id: string }) => {
    return executeVoidApiCallWithEmptyOutput((client) =>
      client.deleteMemberGroupById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof deleteMemberGroupByIdParams.shape, EmptyOutputShape>;

export default withStandardDecorators(DeleteMemberGroupTool);
