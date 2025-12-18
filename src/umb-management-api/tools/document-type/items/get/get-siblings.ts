import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { GetTreeDocumentTypeSiblingsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeDocumentTypeSiblingsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetDocumentTypeSiblingsTool = {
  name: "get-document-type-siblings",
  description: "Gets sibling document types or document type folders for a given descendant id",
  schema: getTreeDocumentTypeSiblingsQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params: GetTreeDocumentTypeSiblingsParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeDocumentTypeSiblings(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof getTreeDocumentTypeSiblingsQueryParams.shape>;

export default withStandardDecorators(GetDocumentTypeSiblingsTool);
