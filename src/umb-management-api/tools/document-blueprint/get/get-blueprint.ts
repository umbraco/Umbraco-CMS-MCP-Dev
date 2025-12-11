import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getDocumentBlueprintByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetDocumentBlueprintTool = CreateUmbracoReadTool(
  "get-document-blueprint",
  "Gets a document blueprint by Id",
  getDocumentBlueprintByIdParams.shape,
  async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentBlueprintById(id);
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

export default GetDocumentBlueprintTool;
