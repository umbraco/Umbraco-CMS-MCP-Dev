import {
  putLanguageByIsoCodeParams,
  putLanguageByIsoCodeBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const inputSchema = {
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
  inputSchema: inputSchema,
  annotations: {
    idempotentHint: true,
  },
  slices: ['update'],
  handler: (async (model: UpdateLanguageModel) => {
    const params = putLanguageByIsoCodeParams.parse({ isoCode: model.isoCode });
    const body = putLanguageByIsoCodeBody.parse(model.data);

    return executeVoidApiCall((client) =>
      client.putLanguageByIsoCode(params.isoCode, body, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema>;

export default withStandardDecorators(UpdateLanguageTool);
