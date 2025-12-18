import { UmbracoManagementClient } from "@umb-management-client";
import { GetTreeDictionaryRootParams } from "@/umb-management-api/schemas/index.js";
import { getTreeDictionaryRootQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetDictionaryRootTool = {
  name: "get-dictionary-root",
  description: "Gets the root level of the dictionary tree",
  schema: getTreeDictionaryRootQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params: GetTreeDictionaryRootParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeDictionaryRoot(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreeDictionaryRootQueryParams.shape>;

export default withStandardDecorators(GetDictionaryRootTool);
