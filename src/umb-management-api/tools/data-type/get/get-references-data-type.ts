import { getDataTypeByIdReferencedByParams, getDataTypeByIdReferencedByResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

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
  `,
  inputSchema: getDataTypeByIdReferencedByParams.shape,
  outputSchema: getDataTypeByIdReferencedByResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['references'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getDataTypeByIdReferencedBy(id, undefined, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getDataTypeByIdReferencedByParams.shape, typeof getDataTypeByIdReferencedByResponse.shape>;

export default withStandardDecorators(GetReferencesDataTypeTool);
