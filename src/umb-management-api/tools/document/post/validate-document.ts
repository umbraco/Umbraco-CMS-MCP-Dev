import { UmbracoManagementClient } from "@umb-management-client";
import { postDocumentValidateBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

const ValidateDocumentTool = {
  name: "validate-document",
  description: "Validates a create document model, using the Umbraco API.",
  schema: postDocumentValidateBody.shape,
  isReadOnly: true,
  slices: ['validate'],
  handler: async (model: z.infer<typeof postDocumentValidateBody>) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postDocumentValidate(model);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof postDocumentValidateBody.shape>;

export default withStandardDecorators(ValidateDocumentTool);
