import { UmbracoManagementClient } from "@umb-management-client";
import { GetCultureParams } from "@/umb-management-api/schemas/index.js";
import { getCultureQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetCulturesTool = {
  name: "get-culture",
  description: "Retrieves a paginated list of cultures that Umbraco can be configured to use",
  schema: getCultureQueryParams.shape,
  isReadOnly: true,
  slices: ['list'],
  handler: async (params: GetCultureParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getCulture(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getCultureQueryParams.shape>;

export default withStandardDecorators(GetCulturesTool);
