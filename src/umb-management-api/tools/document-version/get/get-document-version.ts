import { UmbracoManagementClient } from "@umb-management-client";
import { getDocumentVersionQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetDocumentVersionParams } from "@/umb-management-api/schemas/index.js";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";

const GetDocumentVersionTool = CreateUmbracoReadTool(
  "get-document-version",
  "List document versions with pagination",
  getDocumentVersionQueryParams.shape,
  async (model: GetDocumentVersionParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentVersion(model);

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

export default GetDocumentVersionTool;