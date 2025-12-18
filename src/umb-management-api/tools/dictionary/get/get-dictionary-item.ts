import { UmbracoManagementClient } from "@umb-management-client";
import { getDictionaryByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetDictionaryItemTool = {
  name: "get-dictionary",
  description: "Gets a dictionary by Id",
  schema: getDictionaryByIdParams.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDictionaryById(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getDictionaryByIdParams.shape>;

export default withStandardDecorators(GetDictionaryItemTool);
