import { getMemberByIdReferencedDescendantsParams, getMemberByIdReferencedDescendantsQueryParams, getMemberByIdReferencedDescendantsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const inputSchema = getMemberByIdReferencedDescendantsParams.merge(getMemberByIdReferencedDescendantsQueryParams);

const GetMemberByIdReferencedDescendantsTool = {
  name: "get-member-by-id-referenced-descendants",
  description: `Get descendant references for a member
  Use this to find all descendant references that are being referenced for a specific member account.`,
  inputSchema: inputSchema.shape,
  outputSchema: getMemberByIdReferencedDescendantsResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['references'],
  handler: (async ({ id, skip, take }: { id: string; skip?: number; take?: number }) => {
    return executeGetApiCall((client) =>
      client.getMemberByIdReferencedDescendants(id, { skip, take }, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema.shape, typeof getMemberByIdReferencedDescendantsResponse.shape>;

export default withStandardDecorators(GetMemberByIdReferencedDescendantsTool);
