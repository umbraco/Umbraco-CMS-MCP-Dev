import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { postDocumentTypeBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CreateDocumentTypeRequestModel } from "@/umb-management-api/schemas/index.js";

const ValidateDocumentTypePostTool = {
  name: "validate-document-type-post",
  description: "Validates a document type using the Umbraco API (POST, does not persist changes).",
  schema: postDocumentTypeBody.shape,
  isReadOnly: true,
  slices: ['validate'],
  handler: async (model: CreateDocumentTypeRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postDocumentType(model);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof postDocumentTypeBody.shape>;

export default withStandardDecorators(ValidateDocumentTypePostTool);
