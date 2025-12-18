import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetAllDocumentTypesTool = {
  name: "get-all-document-types",
  description: `Gets all document types by recursively fetching from root and all children.
  This is the preferred approach when you need to understand the full folder structure.
  For large sites, this may take a while to complete. For smaller sites its more efficient than fetching all documents by folder.`,
  schema: {},
  isReadOnly: true,
  slices: ['list'],
  handler: async () => {
    const client = UmbracoManagementClient.getClient();
    const allItems: any[] = [];

    // Get root items
    const rootResponse = await client.getTreeDocumentTypeRoot({
      skip: 0,
      take: 10000
    });
    allItems.push(...rootResponse.items);

    // Recursively get children for each item
    async function getChildrenForItems(items: any[]) {
      for (const item of items) {
        if (item.hasChildren) {
          const childrenResponse = await client.getTreeDocumentTypeChildren({
            parentId: item.id,
            skip: 0,
            take: 10000
          });

          // Add these children to our collection
          allItems.push(...childrenResponse.items);

          // Recursively get children of these children
          if (childrenResponse.items.length > 0) {
            await getChildrenForItems(childrenResponse.items);
          }
        }
      }
    }

    await getChildrenForItems(rootResponse.items);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(allItems),
        },
      ],
    };
  }
} satisfies ToolDefinition<{}>;

export default withStandardDecorators(GetAllDocumentTypesTool); 