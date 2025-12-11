import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import {
  getLanguageByIsoCodeParams,
  getLanguageByIsoCodeResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetLanguageByIsoCodeTool = CreateUmbracoReadTool(
  "get-language-by-iso-code",
  "Gets a language by ISO code",
  getLanguageByIsoCodeParams.shape,
  async (model) => {
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
  }
);

export default GetLanguageByIsoCodeTool;
