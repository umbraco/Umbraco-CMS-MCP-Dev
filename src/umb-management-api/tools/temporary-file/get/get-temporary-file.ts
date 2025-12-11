import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getTemporaryFileByIdParams } from "@/umb-management-api/temporary-file/types.zod.js";

const GetTemporaryFileTool = CreateUmbracoReadTool(
  "get-temporary-file",
  "Gets a temporary file by id",
  getTemporaryFileByIdParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTemporaryFileById(params.id);

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

export default GetTemporaryFileTool;
