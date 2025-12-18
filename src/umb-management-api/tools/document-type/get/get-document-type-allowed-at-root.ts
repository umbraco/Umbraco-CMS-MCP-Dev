import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { getDocumentTypeAllowedAtRootQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetDocumentTypeAllowedAtRootParams } from "@/umb-management-api/schemas/index.js";

const GetDocumentTypeAllowedAtRootTool = {
  name: "get-document-type-allowed-at-root",
  description: "Get document types that are allowed at root level",
  schema: getDocumentTypeAllowedAtRootQueryParams.shape,
  isReadOnly: true,
  slices: ['configuration'],
  handler: async (model: GetDocumentTypeAllowedAtRootParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentTypeAllowedAtRoot(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof getDocumentTypeAllowedAtRootQueryParams.shape>;

export default withStandardDecorators(GetDocumentTypeAllowedAtRootTool);
