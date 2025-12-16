import { UmbracoManagementClient } from "@umb-management-client";
import {
  putDocumentBlueprintFolderByIdParams,
  putDocumentBlueprintFolderByIdBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const updateDocumentBlueprintFolderSchema = z.object({
  id: putDocumentBlueprintFolderByIdParams.shape.id,
  data: z.object(putDocumentBlueprintFolderByIdBody.shape),
});

type SchemaParams = z.infer<typeof updateDocumentBlueprintFolderSchema>;

const UpdateDocumentBlueprintFolderTool = {
  name: "update-document-blueprint-folder",
  description: "Updates a document blueprint folder",
  schema: updateDocumentBlueprintFolderSchema.shape,
  isReadOnly: false,
  slices: ['update', 'folders'],
  handler: async ({ id, data }: SchemaParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putDocumentBlueprintFolderById(id, data);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof updateDocumentBlueprintFolderSchema.shape>;

export default withStandardDecorators(UpdateDocumentBlueprintFolderTool);
