import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/create-umbraco-tool.js";
import { deleteDataTypeByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const DeleteDataTypeTool = CreateUmbracoTool(
  "delete-data-type",
  "Deletes a data type by Id",
  deleteDataTypeByIdParams.shape,
  async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.deleteDataTypeById(id);

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

export default DeleteDataTypeTool;
