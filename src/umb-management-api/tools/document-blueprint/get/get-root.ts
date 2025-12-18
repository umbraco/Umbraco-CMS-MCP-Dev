import { UmbracoManagementClient } from "@umb-management-client";
import { getTreeDocumentBlueprintRootQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

type GetDocumentBlueprintRootParams = {
  skip?: number;
  take?: number;
  dataTypeId?: string;
};

const GetDocumentBlueprintRootTool = {
  name: "get-document-blueprint-root",
  description: "Gets the root level of the document blueprint tree",
  schema: getTreeDocumentBlueprintRootQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params: GetDocumentBlueprintRootParams) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getTreeDocumentBlueprintRoot(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreeDocumentBlueprintRootQueryParams.shape>;

export default withStandardDecorators(GetDocumentBlueprintRootTool);
