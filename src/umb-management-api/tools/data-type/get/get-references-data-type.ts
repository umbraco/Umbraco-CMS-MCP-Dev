import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getDataTypeByIdReferencedByParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetReferencesDataTypeTool = CreateUmbracoTool(
  "get-references-data-type",
  `Gets the document types and properties that use a specific data type.

  This is the recommended method to find all document types that reference a particular data type.

  Usage examples:
  - Find all document types using the RichText editor data type
  - Identify properties that reference a specific data type before modifying or deleting it
  - Perform bulk updates to all properties using a specific data type

  Returns a detailed list with content type information (id, type, name, icon) and all properties
  (name, alias) that use the specified data type.
  `,
  getDataTypeByIdReferencedByParams.shape,
  async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getDataTypeByIdReferencedBy(id);

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

export default GetReferencesDataTypeTool;
