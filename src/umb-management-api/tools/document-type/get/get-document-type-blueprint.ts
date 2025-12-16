import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { getDocumentTypeByIdBlueprintParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetDocumentTypeBlueprintTool = {
  name: "get-document-type-blueprint",
  description: "Gets the blueprints for a document type",
  schema: getDocumentTypeByIdBlueprintParams.shape,
  isReadOnly: true,
  slices: ['blueprints'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentTypeByIdBlueprint(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof getDocumentTypeByIdBlueprintParams.shape>;

export default withStandardDecorators(GetDocumentTypeBlueprintTool);
