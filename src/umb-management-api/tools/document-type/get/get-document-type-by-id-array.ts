import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { getItemDocumentTypeQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetItemDocumentTypeParams } from "@/umb-management-api/schemas/index.js";

const GetDocumentTypesByIdArrayTool = {
  name: "get-document-types-by-id-array",
  description: "Gets document types by IDs (or empty array if no IDs are provided)",
  schema: getItemDocumentTypeQueryParams.shape,
  isReadOnly: true,
  slices: ['list'],
  handler: async (params: GetItemDocumentTypeParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemDocumentType(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof getItemDocumentTypeQueryParams.shape>;

export default withStandardDecorators(GetDocumentTypesByIdArrayTool);
