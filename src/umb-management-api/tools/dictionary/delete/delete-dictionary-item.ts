import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { deleteDictionaryByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const DeleteDictionaryItemTool = CreateUmbracoWriteTool(
  "delete-dictionary-item",
  "Deletes a dictionary item by Id",
  deleteDictionaryByIdParams.shape,
  async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.deleteDictionaryById(id);

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

export default DeleteDictionaryItemTool;
