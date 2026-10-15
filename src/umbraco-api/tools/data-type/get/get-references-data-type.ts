import { getDataTypeByIdReferencedByParams, getDataTypeByIdReferencedByQueryParams, getDataTypeByIdReferencedByResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const inputSchema = z.object({
  ...getDataTypeByIdReferencedByParams.shape,
  ...getDataTypeByIdReferencedByQueryParams.shape,
});

const GetReferencesDataTypeTool = {
  name: "get-references-data-type",
  description: `Gets the document types and properties that use a specific data type.

  This is the recommended method to find all document types that reference a particular data type.

  Usage examples:
  - Find all document types using the RichText editor data type
  - Identify properties that reference a specific data type before modifying or deleting it
  - Perform bulk updates to all properties using a specific data type

  Returns a detailed list with content type information (id, type, name, icon) and all properties
  (name, alias) that use the specified data type.

  Results are paginated (20 per page by default). Check the returned "total" against the number of
  "items" returned - if total is greater, use skip/take to page through the remaining references so
  the list is complete before acting on it.
  `,
  inputSchema: inputSchema.shape,
  outputSchema: getDataTypeByIdReferencedByResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['references'],
  handler: (async ({ id, skip, take }: z.infer<typeof inputSchema>) => {
    return executeGetApiCall((client) =>
      client.getDataTypeByIdReferencedBy(id, { skip, take }, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema.shape, typeof getDataTypeByIdReferencedByResponse.shape>;

export default withStandardDecorators(GetReferencesDataTypeTool);
