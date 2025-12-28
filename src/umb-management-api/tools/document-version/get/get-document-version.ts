import { UmbracoManagementClient } from "@umb-management-client";
import { getDocumentVersionQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetDocumentVersionParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetDocumentVersionTool = {
  name: "get-document-version",
  description: "List document versions with pagination",
  schema: getDocumentVersionQueryParams.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async (model: GetDocumentVersionParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentVersion(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getDocumentVersionQueryParams.shape>;

export default withStandardDecorators(GetDocumentVersionTool);