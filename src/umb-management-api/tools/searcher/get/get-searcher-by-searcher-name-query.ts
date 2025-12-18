import { UmbracoManagementClient } from "@umb-management-client";
import { getSearcherBySearcherNameQueryParams, getSearcherBySearcherNameQueryQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetSearcherBySearcherNameQueryParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

// Combine both parameter schemas for the tool
const combinedSchema = getSearcherBySearcherNameQueryParams.merge(getSearcherBySearcherNameQueryQueryParams);

const GetSearcherBySearcherNameQueryTool = {
  name: "get-searcher-by-searcher-name-query",
  description: `Gets search results from a specific searcher by name with query parameters.
  Returns search results from the specified searcher with pagination support.`,
  schema: combinedSchema.shape,
  isReadOnly: true,
  slices: ['search'],
  handler: async (model: { searcherName: string } & GetSearcherBySearcherNameQueryParams) => {
    const client = UmbracoManagementClient.getClient();
    const { searcherName, ...queryParams } = model;
    const response = await client.getSearcherBySearcherNameQuery(searcherName, queryParams);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof combinedSchema.shape>;

export default withStandardDecorators(GetSearcherBySearcherNameQueryTool);