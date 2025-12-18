import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { getDocumentTypeByIdCompositionReferencesParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetDocumentTypeCompositionReferencesTool = {
  name: "get-document-type-composition-references",
  description: "Gets the composition references for a document type",
  schema: getDocumentTypeByIdCompositionReferencesParams.shape,
  isReadOnly: true,
  slices: ['references'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentTypeByIdCompositionReferences(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof getDocumentTypeByIdCompositionReferencesParams.shape>;

export default withStandardDecorators(GetDocumentTypeCompositionReferencesTool);
