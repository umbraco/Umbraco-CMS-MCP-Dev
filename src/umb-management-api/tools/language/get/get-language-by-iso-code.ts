import { UmbracoManagementClient } from "@umb-management-client";
import {
  getLanguageByIsoCodeParams,
  getLanguageByIsoCodeResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

type GetLanguageByIsoCodeModel = {
  isoCode: string;
};

const GetLanguageByIsoCodeTool = {
  name: "get-language-by-iso-code",
  description: "Gets a language by ISO code",
  schema: getLanguageByIsoCodeParams.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async (model: GetLanguageByIsoCodeModel) => {
    const client = UmbracoManagementClient.getClient();
    const params = getLanguageByIsoCodeParams.parse(model);
    const response = await client.getLanguageByIsoCode(params.isoCode);
    const validated = getLanguageByIsoCodeResponse.parse(response);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(validated, null, 2),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getLanguageByIsoCodeParams.shape>;

export default withStandardDecorators(GetLanguageByIsoCodeTool);
