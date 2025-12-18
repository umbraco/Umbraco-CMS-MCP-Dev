import { UmbracoManagementClient } from "@umb-management-client";
import { getDocumentByIdReferencedByParams, getDocumentByIdReferencedByQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const schema = z.object({
  ...getDocumentByIdReferencedByParams.shape,
  ...getDocumentByIdReferencedByQueryParams.shape,
});

const GetDocumentByIdReferencedByTool = {
  name: "get-document-by-id-referenced-by",
  description: `Get items that reference a specific document item
  Use this to find all content, documents, or other items that are currently referencing a specific document item.`,
  schema: schema.shape,
  isReadOnly: true,
  slices: ['references'],
  handler: async ({ id, skip, take }: z.infer<typeof schema>) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentByIdReferencedBy(id, { skip, take });
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

export default withStandardDecorators(GetDocumentByIdReferencedByTool);