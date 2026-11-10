import { UmbracoManagementClient } from "@umb-management-client";
import { postSearchSearchBody, postSearchSearchQueryParams, postSearchSearchResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { SearchResultResponseModel } from "@/umbraco-api/schemas/index.js";
import { z } from "zod";
import {
  type ToolDefinition,
  type HttpResponse,
  CAPTURE_RAW_HTTP_RESPONSE,
  UmbracoApiError,
  createToolResult,
  toProblemDetails,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const inputSchema = postSearchSearchBody.merge(postSearchSearchQueryParams);

// The API returns { total, documents }; the SDK's cursor pagination keys off
// { total, items }, so expose the hits as `items` to get a working nextCursor.
const outputSchema = z.object({
  total: postSearchSearchResponse.shape.total,
  items: postSearchSearchResponse.shape.documents,
});

const SearchIndexedContentTool = {
  name: "search-indexed-content",
  description: `Runs a free-text query against a specific Umbraco Search index.
  - indexAlias (required): the index to query, e.g. "Umb_Content" (all content, including unpublished), "Umb_PublishedContent", "Umb_Media", "Umb_Members" or "Umb_Elements". Use get-search-indexes to list them.
  - query: the search text
  - culture / segment: optionally restrict to a variant
  Returns total and an items array of { id, objectType, name, icon }; pass nextCursor back to get the next page.
  Use the id with the matching get tool (e.g. get-document-by-id) for full details.`,
  inputSchema: inputSchema.shape,
  outputSchema: outputSchema.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['search'],
  handler: async (model: z.infer<typeof inputSchema>) => {
    const { skip, take, ...body } = model;
    const client = UmbracoManagementClient.getClient();
    const response = (await client.postSearchSearch(
      body,
      { skip, take },
      CAPTURE_RAW_HTTP_RESPONSE
    )) as unknown as HttpResponse<SearchResultResponseModel>;
    if (response.status < 200 || response.status >= 300) {
      throw new UmbracoApiError(toProblemDetails(response));
    }
    const data = response.data;
    return createToolResult({ total: data.total, items: data.documents });
  },
} satisfies ToolDefinition<typeof inputSchema.shape, typeof outputSchema.shape>;

export default withStandardDecorators(SearchIndexedContentTool);
