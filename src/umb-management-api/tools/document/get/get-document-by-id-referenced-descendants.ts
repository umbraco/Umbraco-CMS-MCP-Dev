import { UmbracoManagementClient } from "@umb-management-client";
import { getDocumentByIdReferencedDescendantsParams, getDocumentByIdReferencedDescendantsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const schema = z.object({
  ...getDocumentByIdReferencedDescendantsParams.shape,
  ...getDocumentByIdReferencedDescendantsQueryParams.shape,
});

const GetDocumentByIdReferencedDescendantsTool = {
  name: "get-document-by-id-referenced-descendants",
  description: `Get descendant references for a document item
  Use this to find all descendant references (child items) that are being referenced for a specific document item.

  Useful for:
  • Impact analysis: Before deleting a document folder, see what content would be affected
  • Dependency tracking: Find all content using documents from a specific folder hierarchy
  • Content auditing: Identify which descendant document items are actually being used`,
  schema: schema.shape,
  isReadOnly: true,
  slices: ['references'],
  handler: async ({ id, skip, take }: z.infer<typeof schema>) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentByIdReferencedDescendants(id, { skip, take });
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof schema.shape>;

export default withStandardDecorators(GetDocumentByIdReferencedDescendantsTool);