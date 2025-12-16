import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { GetTreeDocumentTypeChildrenParams } from "@/umb-management-api/schemas/index.js";
import { getTreeDocumentTypeChildrenQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetDocumentTypeChildrenTool = {
  name: "get-document-type-children",
  description: "Gets the children of a document type. Use get-all-document-types instead unless you specifically need only child level items for a specific folder.",
  schema: getTreeDocumentTypeChildrenQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params: GetTreeDocumentTypeChildrenParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeDocumentTypeChildren(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof getTreeDocumentTypeChildrenQueryParams.shape>;

export default withStandardDecorators(GetDocumentTypeChildrenTool);
