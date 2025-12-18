import { UmbracoManagementClient } from "@umb-management-client";
import { getDataTypeByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetDataTypeTool = {
  name: "get-data-type",
  description: "Gets a data type by Id",
  schema: getDataTypeByIdParams.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDataTypeById(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getDataTypeByIdParams.shape>;

export default withStandardDecorators(GetDataTypeTool);
