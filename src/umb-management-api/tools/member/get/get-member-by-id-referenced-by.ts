import { UmbracoManagementClient } from "@umb-management-client";
import { getMemberByIdReferencedByParams, getMemberByIdReferencedByQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const getMemberByIdReferencedBySchema = z.object({
  ...getMemberByIdReferencedByParams.shape,
  ...getMemberByIdReferencedByQueryParams.shape,
}).shape;

const GetMemberByIdReferencedByTool = {
  name: "get-member-by-id-referenced-by",
  description: `Get items that reference a specific member
  Use this to find all content, documents, or other items that are currently referencing a specific member account.`,
  schema: getMemberByIdReferencedBySchema,
  isReadOnly: true,
  slices: ['references'],
  handler: async ({ id, skip, take }: { id: string; skip?: number; take?: number }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getMemberByIdReferencedBy(id, { skip, take });
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getMemberByIdReferencedBySchema>;

export default withStandardDecorators(GetMemberByIdReferencedByTool);