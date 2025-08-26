import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/create-umbraco-tool.js";
import { getRecycleBinDocumentRootQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetRecycleBinDocumentRootTool = CreateUmbracoTool(
  "get-recycle-bin-document-root",
  "Gets root items for the document recycle bin.",
  getRecycleBinDocumentRootQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getRecycleBinDocumentRoot(params);
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

export default GetRecycleBinDocumentRootTool;
