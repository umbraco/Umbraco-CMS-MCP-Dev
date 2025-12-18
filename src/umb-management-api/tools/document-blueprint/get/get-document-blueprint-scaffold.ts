import { UmbracoManagementClient } from "@umb-management-client";
import { getDocumentBlueprintByIdScaffoldParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetDocumentBlueprintScaffoldTool = {
  name: "get-document-blueprint-scaffold",
  description: `Get scaffold information for a document blueprint
  Use this to retrieve the scaffold structure and default values for a document blueprint, typically used when creating new documents from blueprints.`,
  schema: getDocumentBlueprintByIdScaffoldParams.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentBlueprintByIdScaffold(id);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getDocumentBlueprintByIdScaffoldParams.shape>;

export default withStandardDecorators(GetDocumentBlueprintScaffoldTool);