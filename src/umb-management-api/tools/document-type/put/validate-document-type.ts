import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import {
  putDocumentTypeByIdParams,
  putDocumentTypeByIdBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { UpdateDocumentTypeRequestModel } from "@/umb-management-api/schemas/index.js";

const validateDocumentTypeSchema = {
  id: putDocumentTypeByIdParams.shape.id,
  data: z.object(putDocumentTypeByIdBody.shape),
};

const ValidateDocumentTypeTool = {
  name: "validate-document-type",
  description: "Validates a document type using the Umbraco API (PUT, does not persist changes).",
  schema: validateDocumentTypeSchema,
  isReadOnly: true,
  slices: ['validate'],
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
} satisfies ToolDefinition<typeof validateDocumentTypeSchema>;

export default withStandardDecorators(ValidateDocumentTypeTool);
