import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { getDocumentTypeByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetDocumentTypeByIdTool = {
  name: "get-document-type-by-id",
  description: "Gets a document type by id",
  schema: getDocumentTypeByIdParams.shape,
  isReadOnly: true,
  slices: ['list'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentTypeById(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof getDocumentTypeByIdParams.shape>;

export default withStandardDecorators(GetDocumentTypeByIdTool);
