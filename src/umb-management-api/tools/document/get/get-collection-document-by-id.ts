import { getCollectionDocumentByIdParams, getCollectionDocumentByIdQueryParams, getCollectionDocumentByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const inputSchema = z.object({
  ...getCollectionDocumentByIdParams.shape,
  ...getCollectionDocumentByIdQueryParams.shape,
});

const GetCollectionDocumentByIdTool = {
  name: "get-collection-document-by-id",
  description: `Get a collection of document items
  Use this to retrieve a filtered and paginated collection of document items based on various criteria like data type, ordering, and filtering.`,
  inputSchema: inputSchema.shape,
  outputSchema: getCollectionDocumentByIdResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['search'],
  handler: (async ({ id, dataTypeId, orderBy, orderDirection, filter, skip, take }: z.infer<typeof inputSchema>) => {
    return executeGetApiCall((client) =>
      client.getCollectionDocumentById(id, {
        dataTypeId,
        orderBy,
        orderDirection,
        filter,
        skip,
        take
      }, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema.shape, typeof getCollectionDocumentByIdResponse.shape>;

export default withStandardDecorators(GetCollectionDocumentByIdTool);