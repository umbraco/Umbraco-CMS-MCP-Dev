import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { postDocumentTypeByIdCopyBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { CopyDocumentTypeRequestModel } from "@/umb-management-api/schemas/copyDocumentTypeRequestModel.js";

const copyDocumentTypeSchema = {
  id: z.string().uuid(),
  data: z.object(postDocumentTypeByIdCopyBody.shape),
};

const CopyDocumentTypeTool = {
  name: "copy-document-type",
  description: "Copy a document type to a new location",
  schema: copyDocumentTypeSchema,
  isReadOnly: false,
  slices: ['copy'],
  handler: async (model: { id: string; data: CopyDocumentTypeRequestModel }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postDocumentTypeByIdCopy(
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
} satisfies ToolDefinition<typeof copyDocumentTypeSchema>;

export default withStandardDecorators(CopyDocumentTypeTool);
