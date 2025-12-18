import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { postDocumentTypeAvailableCompositionsBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";

type SchemaParams = z.infer<typeof postDocumentTypeAvailableCompositionsBody>;

const GetDocumentTypeAvailableCompositionsTool = {
  name: "get-document-type-available-compositions",
  description: "Gets the available compositions for a document type",
  schema: postDocumentTypeAvailableCompositionsBody.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async (model: SchemaParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postDocumentTypeAvailableCompositions(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof postDocumentTypeAvailableCompositionsBody.shape>;

export default withStandardDecorators(GetDocumentTypeAvailableCompositionsTool);
