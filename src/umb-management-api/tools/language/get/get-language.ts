import { UmbracoManagementClient } from "@umb-management-client";
import {
  getLanguageQueryParams,
  getLanguageResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { GetLanguageParams } from "@/umb-management-api/schemas/index.js";

const GetLanguageTool = {
  name: "get-language",
  description: "Gets all languages with optional pagination",
  schema: getLanguageQueryParams.shape,
  isReadOnly: true,
  slices: ['list'],
  handler: async (params: GetLanguageParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getLanguage(params);
    const validated = getLanguageResponse.parse(response);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(validated, null, 2),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getLanguageQueryParams.shape>;

export default withStandardDecorators(GetLanguageTool);
