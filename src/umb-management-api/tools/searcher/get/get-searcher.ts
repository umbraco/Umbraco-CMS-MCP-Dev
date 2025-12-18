import { UmbracoManagementClient } from "@umb-management-client";
import { getSearcherQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetSearcherParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetSearcherTool = {
  name: "get-searcher",
  description: `Lists all searchers with pagination support.
  Returns an object containing:
  - total: Total number of searchers (number)
  - items: Array of searcher objects with name and isEnabled properties`,
  schema: getSearcherQueryParams.shape,
  isReadOnly: true,
  slices: ['list'],
  handler: async (model: GetSearcherParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getSearcher(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof getSearcherQueryParams.shape>;

export default withStandardDecorators(GetSearcherTool);