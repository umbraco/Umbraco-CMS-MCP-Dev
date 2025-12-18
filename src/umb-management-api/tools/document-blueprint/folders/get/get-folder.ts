import { UmbracoManagementClient } from "@umb-management-client";
import { getDocumentBlueprintFolderByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetDocumentBlueprintFolderTool = {
  name: "get-document-blueprint-folder",
  description: "Gets a document blueprint folder by Id",
  schema: getDocumentBlueprintFolderByIdParams.shape,
  isReadOnly: true,
  slices: ['read', 'folders'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getDocumentBlueprintFolderById(id);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getDocumentBlueprintFolderByIdParams.shape>;

export default withStandardDecorators(GetDocumentBlueprintFolderTool);
