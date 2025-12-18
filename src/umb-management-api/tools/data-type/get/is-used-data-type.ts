import { UmbracoManagementClient } from "@umb-management-client";
import { getDataTypeByIdIsUsedParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const IsUsedDataTypeTool = {
  name: "is-used-data-type",
  description: "Checks if a data type is used within Umbraco",
  schema: getDataTypeByIdIsUsedParams.shape,
  isReadOnly: true,
  slices: ['references'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDataTypeByIdIsUsed(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getDataTypeByIdIsUsedParams.shape>;

export default withStandardDecorators(IsUsedDataTypeTool);
