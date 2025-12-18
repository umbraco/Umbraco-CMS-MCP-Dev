import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import {
  putDocumentTypeFolderByIdParams,
  putDocumentTypeFolderByIdBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";

const updateDocumentTypeFolderSchema = {
  id: putDocumentTypeFolderByIdParams.shape.id,
  data: z.object(putDocumentTypeFolderByIdBody.shape),
};

const UpdateDocumentTypeFolderTool = {
  name: "update-document-type-folder",
  description: "Updates a document type folder by Id",
  schema: updateDocumentTypeFolderSchema,
  isReadOnly: false,
  slices: ['update', 'folders'],
  handler: async (model: { id: string; data: { name: string } }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putDocumentTypeFolderById(
      model.id,
      model.data
    );

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof updateDocumentTypeFolderSchema>;

export default withStandardDecorators(UpdateDocumentTypeFolderTool);
