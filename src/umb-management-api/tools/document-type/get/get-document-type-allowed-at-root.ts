import { UmbracoManagementClient } from "@umb-management-client";
import { getDocumentTypeAllowedAtRootQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetDocumentTypeAllowedAtRootParams } from "@/umb-management-api/schemas/index.js";
import { CreateUmbracoTool } from "@/helpers/create-umbraco-tool.js";

const GetDocumentTypeAllowedAtRootTool = CreateUmbracoTool(
  "get-document-type-allowed-at-root",
  "Get document types that are allowed at root level",
  getDocumentTypeAllowedAtRootQueryParams.shape,
  async (model: GetDocumentTypeAllowedAtRootParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentTypeAllowedAtRoot(model);

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

export default GetDocumentTypeAllowedAtRootTool;
