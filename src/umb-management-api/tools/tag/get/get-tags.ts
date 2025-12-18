import { UmbracoManagementClient } from "@umb-management-client";
import { GetTagParams } from "@/umb-management-api/schemas/index.js";
import { getTagQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetTagsTool = {
  name: "get-tags",
  description: "Retrieves a paginated list of tags used in the Umbraco instance",
  schema: getTagQueryParams.shape,
  isReadOnly: true,
  slices: ['list'],
  handler: async (params: GetTagParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTag(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTagQueryParams.shape>;

export default withStandardDecorators(GetTagsTool);