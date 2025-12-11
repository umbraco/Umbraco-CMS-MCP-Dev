import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { postLanguageBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const CreateLanguageTool = CreateUmbracoWriteTool(
  "create-language",
  "Creates a new language",
  postLanguageBody.shape,
  async (model) => {
    const client = UmbracoManagementClient.getClient();
    const validated = postLanguageBody.parse(model);
    await client.postLanguage(validated);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            { success: true, isoCode: validated.isoCode },
            null,
            2
          ),
        },
      ],
    };
  }
);

export default CreateLanguageTool;
