import { UmbracoManagementClient } from "@umb-management-client";
import { getDocumentBlueprintByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetDocumentBlueprintTool = {
  name: "get-document-blueprint",
  description: "Gets a document blueprint by Id",
  schema: getDocumentBlueprintByIdParams.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentBlueprintById(id);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getDocumentBlueprintByIdParams.shape>;

export default withStandardDecorators(GetDocumentBlueprintTool);
