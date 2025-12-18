import { UmbracoManagementClient } from "@umb-management-client";
import { getDocumentVersionByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetDocumentVersionByIdTool = {
  name: "get-document-version-by-id",
  description: "Get specific document version by ID",
  schema: getDocumentVersionByIdParams.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentVersionById(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getDocumentVersionByIdParams.shape>;

export default withStandardDecorators(GetDocumentVersionByIdTool);