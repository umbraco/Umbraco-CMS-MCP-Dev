import { UmbracoManagementClient } from "@umb-management-client";
import { getTemporaryFileByIdParams } from "@/umb-management-api/temporary-file/types.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetTemporaryFileTool = {
  name: "get-temporary-file",
  description: "Gets a temporary file by id",
  schema: getTemporaryFileByIdParams.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async (params: { id: string }) => {
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
} satisfies ToolDefinition<typeof getTemporaryFileByIdParams.shape>;

export default withStandardDecorators(GetTemporaryFileTool);
