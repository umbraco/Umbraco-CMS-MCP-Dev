import { getMemberByIdReferencedByParams, getMemberByIdReferencedByQueryParams, getMemberByIdReferencedByResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const inputSchema = getMemberByIdReferencedByParams.merge(getMemberByIdReferencedByQueryParams);

const GetMemberByIdReferencedByTool = {
  name: "get-member-by-id-referenced-by",
  description: `Get items that reference a specific member
  Use this to find all content, documents, or other items that are currently referencing a specific member account.`,
  inputSchema: inputSchema.shape,
  outputSchema: getMemberByIdReferencedByResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['references'],
  handler: (async ({ id, skip, take }: { id: string; skip?: number; take?: number }) => {
    return executeGetApiCall((client) =>
      client.getMemberByIdReferencedBy(id, { skip, take }, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema.shape, typeof getMemberByIdReferencedByResponse.shape>;

export default withStandardDecorators(GetMemberByIdReferencedByTool);
