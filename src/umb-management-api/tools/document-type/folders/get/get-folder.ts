import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { getDocumentTypeFolderByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetDocumentTypeFolderTool = {
  name: "get-document-type-folder",
  description: "Gets a document type folder by Id",
  schema: getDocumentTypeFolderByIdParams.shape,
  isReadOnly: true,
  slices: ['read', 'folders'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentTypeFolderById(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof getDocumentTypeFolderByIdParams.shape>;

export default withStandardDecorators(GetDocumentTypeFolderTool);
