import { getMemberByIdParams, getMemberByIdResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetMemberTool = {
  name: "get-member",
  description: `Gets a member by Id.
  Account state (isApproved, isLockedOut, isTwoFactorEnabled, failedPasswordAttempts, lastLoginDate, lastLockoutDate, lastPasswordChangeDate) is only returned to users with access to sensitive data; otherwise Umbraco reports default values (false/0/null), which do not reflect the member's actual state.`,
  inputSchema: getMemberByIdParams.shape,
  outputSchema: getMemberByIdResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getMemberById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getMemberByIdParams.shape, typeof getMemberByIdResponse.shape>;

export default withStandardDecorators(GetMemberTool);
