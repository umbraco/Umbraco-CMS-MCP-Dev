import { UmbracoManagementClient } from "@umb-management-client";
import { getMemberByIdReferencedDescendantsParams, getMemberByIdReferencedDescendantsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const getMemberByIdReferencedDescendantsSchema = z.object({
  ...getMemberByIdReferencedDescendantsParams.shape,
  ...getMemberByIdReferencedDescendantsQueryParams.shape,
}).shape;

const GetMemberByIdReferencedDescendantsTool = {
  name: "get-member-by-id-referenced-descendants",
  description: `Get descendant references for a member
  Use this to find all descendant references that are being referenced for a specific member account.`,
  schema: getMemberByIdReferencedDescendantsSchema,
  isReadOnly: true,
  slices: ['references'],
  handler: async ({ id, skip, take }: { id: string; skip?: number; take?: number }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getMemberByIdReferencedDescendants(id, { skip, take });
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getMemberByIdReferencedDescendantsSchema>;

export default withStandardDecorators(GetMemberByIdReferencedDescendantsTool);