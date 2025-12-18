import { UmbracoManagementClient } from "@umb-management-client";
import { getTreeDocumentBlueprintChildrenQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

type GetDocumentBlueprintChildrenParams = {
  parentId?: string;
  skip?: number;
  take?: number;
  dataTypeId?: string;
};

const GetDocumentBlueprintChildrenTool = {
  name: "get-document-blueprint-children",
  description: "Gets the children of a document blueprint by Id",
  schema: getTreeDocumentBlueprintChildrenQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params: GetDocumentBlueprintChildrenParams) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getTreeDocumentBlueprintChildren(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreeDocumentBlueprintChildrenQueryParams.shape>;

export default withStandardDecorators(GetDocumentBlueprintChildrenTool);
