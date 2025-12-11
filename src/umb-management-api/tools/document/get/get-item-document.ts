import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getItemDocumentQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetItemDocumentTool = CreateUmbracoReadTool(
  "get-item-document",
  "Gets document items by their ids",
  getItemDocumentQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemDocument(params);

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

export default GetItemDocumentTool;
