import { UmbracoManagementClient } from "@umb-management-client";
import { getMemberAreReferencedQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

type SchemaParams = z.infer<typeof getMemberAreReferencedQueryParams>;

const GetMemberAreReferencedTool = {
  name: "get-member-are-referenced",
  description: `Check if member accounts are referenced
  Use this to verify if specific member accounts are being referenced by content.`,
  schema: getMemberAreReferencedQueryParams.shape,
  isReadOnly: true,
  slices: ['references'],
  handler: async ({ id, skip, take }: SchemaParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getMemberAreReferenced({ id, skip, take });
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getMemberAreReferencedQueryParams.shape>;

export default withStandardDecorators(GetMemberAreReferencedTool);