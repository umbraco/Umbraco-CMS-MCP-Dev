import { UmbracoManagementClient } from "@umb-management-client";
import { postLanguageBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

type CreateLanguageModel = z.infer<typeof postLanguageBody>;

const CreateLanguageTool = {
  name: "create-language",
  description: "Creates a new language",
  schema: postLanguageBody.shape,
  isReadOnly: false,
  slices: ['create'],
  handler: async (model: CreateLanguageModel) => {
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
  },
} satisfies ToolDefinition<typeof postLanguageBody.shape>;

export default withStandardDecorators(CreateLanguageTool);
