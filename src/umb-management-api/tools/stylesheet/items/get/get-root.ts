import { UmbracoManagementClient } from "@umb-management-client";
import { GetTreeStylesheetRootParams } from "@/umb-management-api/schemas/index.js";
import { getTreeStylesheetRootQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetStylesheetRootTool = {
  name: "get-stylesheet-root",
  description: "Gets the root stylesheets in the tree structure",
  schema: getTreeStylesheetRootQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (model: GetTreeStylesheetRootParams) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getTreeStylesheetRoot(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof getTreeStylesheetRootQueryParams.shape>;

export default withStandardDecorators(GetStylesheetRootTool);