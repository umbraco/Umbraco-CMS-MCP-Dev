import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { CreateFolderRequestModel } from "@/umb-management-api/schemas/index.js";
import { postDocumentTypeFolderBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const CreateDocumentTypeFolderTool = {
  name: "create-document-type-folder",
  description: "Creates a new document type folder",
  schema: postDocumentTypeFolderBody.shape,
  isReadOnly: false,
  slices: ['create', 'folders'],
  handler: async (model: CreateFolderRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postDocumentTypeFolder(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof postDocumentTypeFolderBody.shape>;

export default withStandardDecorators(CreateDocumentTypeFolderTool);
