import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/create-umbraco-tool.js";
import {
  putLanguageByIsoCodeParams,
  putLanguageByIsoCodeBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";

const UpdateLanguageTool = CreateUmbracoTool(
  "update-language",
  "Updates an existing language by ISO code",
  {
    isoCode: putLanguageByIsoCodeParams.shape.isoCode,
    data: z.object(putLanguageByIsoCodeBody.shape),
  },
  async (model: {
    isoCode: string;
    data: z.infer<typeof putLanguageByIsoCodeBody>;
  }) => {
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
  }
);

export default UpdateLanguageTool;
