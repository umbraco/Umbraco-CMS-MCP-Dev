import { UmbracoManagementClient } from "@umb-management-client";
import { GetFilterDataTypeParams } from "@/umb-management-api/schemas/index.js";
import { getFilterDataTypeQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const FindDataTypeTool = {
  name: "find-data-type",
  description: "Finds a data type by Id or Name",
  schema: getFilterDataTypeQueryParams.shape,
  isReadOnly: true,
  slices: ['search'],
  handler: async (model: GetFilterDataTypeParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getFilterDataType(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getFilterDataTypeQueryParams.shape>;

export default withStandardDecorators(FindDataTypeTool);
