import { UmbracoManagementClient } from "@umb-management-client";
import { deleteLanguageByIsoCodeParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

type DeleteLanguageModel = {
  isoCode: string;
};

const DeleteLanguageTool = {
  name: "delete-language",
  description: "Deletes a language by ISO code",
  schema: deleteLanguageByIsoCodeParams.shape,
  isReadOnly: false,
  slices: ['delete'],
  handler: async ({ isoCode }: DeleteLanguageModel) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.deleteLanguageByIsoCode(isoCode);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof deleteLanguageByIsoCodeParams.shape>;

export default withStandardDecorators(DeleteLanguageTool);
