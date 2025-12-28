import { UmbracoManagementClient } from "@umb-management-client";
import { GetTreeDictionaryChildrenParams } from "@/umb-management-api/schemas/index.js";
import { getTreeDictionaryChildrenQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetDictionaryChildrenTool = {
  name: "get-dictionary-children",
  description: "Gets the children of a dictionary item by Id",
  schema: getTreeDictionaryChildrenQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params: GetTreeDictionaryChildrenParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeDictionaryChildren(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreeDictionaryChildrenQueryParams.shape>;

export default withStandardDecorators(GetDictionaryChildrenTool);
