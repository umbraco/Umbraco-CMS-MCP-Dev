import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { UpdateDocumentTypeRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  putDocumentTypeByIdParams,
  putDocumentTypeByIdBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";

const updateDocumentTypeSchema = {
  id: putDocumentTypeByIdParams.shape.id,
  data: z.object(putDocumentTypeByIdBody.shape),
};

const UpdateDocumentTypeTool = {
  name: "update-document-type",
  description: "Updates a document type by Id",
  schema: updateDocumentTypeSchema,
  isReadOnly: false,
  slices: ['update'],
  handler: async (model: { id: string; data: UpdateDocumentTypeRequestModel }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putDocumentTypeById(model.id, model.data);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof updateDocumentTypeSchema>;

export default withStandardDecorators(UpdateDocumentTypeTool);
