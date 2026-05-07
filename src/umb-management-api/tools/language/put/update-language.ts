import {
  putLanguageByIsoCodeParams,
  putLanguageByIsoCodeBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";
import {
  emptyOutputShape,
  executeVoidApiCallWithEmptyOutput,
  type EmptyOutputShape,
} from "../../shared/execute-void-with-empty-output.js";

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
  outputSchema: emptyOutputShape,
  annotations: {
    idempotentHint: true,
  },
  slices: ['update'],
  handler: (async (model: UpdateLanguageModel) => {
    const params = putLanguageByIsoCodeParams.parse({ isoCode: model.isoCode });
    const body = putLanguageByIsoCodeBody.parse(model.data);

    return executeVoidApiCallWithEmptyOutput((client) =>
      client.putLanguageByIsoCode(params.isoCode, body, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema, EmptyOutputShape>;

export default withStandardDecorators(UpdateLanguageTool);
