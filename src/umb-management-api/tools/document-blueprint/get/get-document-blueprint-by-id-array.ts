import { UmbracoManagementClient } from "@umb-management-client";
import { getItemDocumentBlueprintQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

type GetDocumentBlueprintByIdArrayParams = {
  id?: string[];
};

const GetDocumentBlueprintByIdArrayTool = {
  name: "get-document-blueprint-by-id-array",
  description: "Gets document blueprints by IDs (or empty array if no IDs are provided)",
  schema: getItemDocumentBlueprintQueryParams.shape,
  isReadOnly: true,
  slices: ['list'],
  handler: async (params: GetDocumentBlueprintByIdArrayParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemDocumentBlueprint(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getItemDocumentBlueprintQueryParams.shape>;

export default withStandardDecorators(GetDocumentBlueprintByIdArrayTool);
