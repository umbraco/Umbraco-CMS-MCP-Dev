import { UmbracoManagementClient } from "@umb-management-client";
import { GetDictionaryParams } from "@/umb-management-api/schemas/index.js";
import { getDictionaryQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const FindDictionaryItemTool = {
  name: "find-dictionary",
  description: "Finds a dictionary by Id or name",
  schema: getDictionaryQueryParams.shape,
  isReadOnly: true,
  slices: ['search'],
  handler: async (model: GetDictionaryParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDictionary(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getDictionaryQueryParams.shape>;

export default withStandardDecorators(FindDictionaryItemTool);
