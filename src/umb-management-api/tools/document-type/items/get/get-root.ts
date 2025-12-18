import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { GetTreeDocumentTypeRootParams } from "@/umb-management-api/schemas/index.js";
import { getTreeDocumentTypeRootQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetDocumentTypeRootTool = {
  name: "get-document-type-root",
  description: "Gets the root level of the document type tree. Use get-all-document-types instead unless you specifically need only root level items.",
  schema: getTreeDocumentTypeRootQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params: GetTreeDocumentTypeRootParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeDocumentTypeRoot(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof getTreeDocumentTypeRootQueryParams.shape>;

export default withStandardDecorators(GetDocumentTypeRootTool);
