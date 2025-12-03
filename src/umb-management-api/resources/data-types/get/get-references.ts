import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTemplateResource } from "@/helpers/mcp/create-umbraco-template-resource.js";
import { getDataTypeByIdReferencedByParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";

const GetDataTypeReferencesResource = CreateUmbracoTemplateResource(
  "Get Data Type References",
  "Get references to a data type from content types",
  new ResourceTemplate("umbraco://data-type/{id}/references", {
    list: undefined,
    complete: {
      id: (value: string) => [], // This will be populated dynamically
    },
  }),
  async (uri, variables) => {
    try {
      const client = UmbracoManagementClient.getClient();
      const params = getDataTypeByIdReferencedByParams.parse(variables);
      const response = await client.getDataTypeByIdReferencedBy(params.id);
      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(response, null, 2),
            mimeType: "application/json",
          },
        ],
      };
    } catch (error) {
      console.error("Error in GetDataTypeReferencesResource:", error);
      throw error;
    }
  }
);

export default GetDataTypeReferencesResource;
