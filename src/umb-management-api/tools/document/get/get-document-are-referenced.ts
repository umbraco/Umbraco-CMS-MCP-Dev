import { UmbracoManagementClient } from "@umb-management-client";
import { getDocumentAreReferencedQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

const GetDocumentAreReferencedTool = {
  name: "get-document-are-referenced",
  description: `Check if document items are referenced
  Use this to verify if specific document items are being referenced by other content before deletion or modification.`,
  schema: getDocumentAreReferencedQueryParams.shape,
  isReadOnly: true,
  slices: ['references'],
  handler: async ({ id, skip, take }: z.infer<typeof getDocumentAreReferencedQueryParams>) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentAreReferenced({ id, skip, take });
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getDocumentAreReferencedQueryParams.shape>;

export default withStandardDecorators(GetDocumentAreReferencedTool);