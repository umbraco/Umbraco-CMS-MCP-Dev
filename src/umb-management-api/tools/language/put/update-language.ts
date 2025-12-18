import { UmbracoManagementClient } from "@umb-management-client";
import {
  putLanguageByIsoCodeParams,
  putLanguageByIsoCodeBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const updateLanguageSchema = {
  isoCode: putLanguageByIsoCodeParams.shape.isoCode,
  data: z.object(putLanguageByIsoCodeBody.shape),
};

type UpdateLanguageModel = {
  isoCode: string;
  data: z.infer<typeof putLanguageByIsoCodeBody>;
};

const UpdateLanguageTool = {
  name: "update-language",
  description: "Updates an existing language by ISO code",
  schema: updateLanguageSchema,
  isReadOnly: false,
  slices: ['update'],
  handler: async (model: UpdateLanguageModel) => {
    const client = UmbracoManagementClient.getClient();
    const params = putLanguageByIsoCodeParams.parse({ isoCode: model.isoCode });
    const body = putLanguageByIsoCodeBody.parse(model.data);
    await client.putLanguageByIsoCode(params.isoCode, body);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            { success: true, isoCode: params.isoCode },
            null,
            2
          ),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof updateLanguageSchema>;

export default withStandardDecorators(UpdateLanguageTool);
