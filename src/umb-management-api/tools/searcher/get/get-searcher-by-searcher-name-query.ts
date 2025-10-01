import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getSearcherBySearcherNameQueryParams, getSearcherBySearcherNameQueryQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetSearcherBySearcherNameQueryParams } from "@/umb-management-api/schemas/index.js";
import { z } from "zod";

// Combine both parameter schemas for the tool
const combinedSchema = getSearcherBySearcherNameQueryParams.merge(getSearcherBySearcherNameQueryQueryParams);

const GetSearcherBySearcherNameQueryTool = CreateUmbracoTool(
  "get-searcher-by-searcher-name-query",
  `Gets search results from a specific searcher by name with query parameters.
  Returns search results from the specified searcher with pagination support.`,
  combinedSchema.shape,
  async (model: { searcherName: string } & GetSearcherBySearcherNameQueryParams) => {
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
);

export default GetSearcherBySearcherNameQueryTool;