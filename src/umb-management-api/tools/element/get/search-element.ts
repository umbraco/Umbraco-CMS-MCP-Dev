import { getItemElementSearchQueryParams, getItemElementSearchResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoElementPermissions } from "../constants.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const SearchElementTool = {
  name: "search-element",
  description: "Searches for elements by query, skip, and take.",
  inputSchema: getItemElementSearchQueryParams.shape,
  outputSchema: getItemElementSearchResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['search'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoElementPermissions.Read),
  handler: (async (params: z.infer<typeof getItemElementSearchQueryParams>) => {
    return executeGetApiCall((client) =>
      client.getItemElementSearch(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemElementSearchQueryParams.shape, typeof getItemElementSearchResponse.shape>;

export default withStandardDecorators(SearchElementTool);
