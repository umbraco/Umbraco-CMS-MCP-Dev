import { UmbracoManagementClient } from "@umb-management-client";
import { GetTreeDictionaryAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeDictionaryAncestorsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetDictionaryAncestorsTool = {
  name: "get-dictionary-ancestors",
  description: "Gets the ancestors of a dictionary item by Id",
  schema: getTreeDictionaryAncestorsQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params: GetTreeDictionaryAncestorsParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeDictionaryAncestors(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreeDictionaryAncestorsQueryParams.shape>;

export default withStandardDecorators(GetDictionaryAncestorsTool);
