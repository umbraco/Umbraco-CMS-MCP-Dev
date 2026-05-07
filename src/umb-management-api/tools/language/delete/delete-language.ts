import { deleteLanguageByIsoCodeParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
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

const DeleteLanguageTool = {
  name: "delete-language",
  description: "Deletes a language by ISO code",
  inputSchema: deleteLanguageByIsoCodeParams.shape,
  outputSchema: emptyOutputShape,
  annotations: {
    destructiveHint: true,
  },
  slices: ['delete'],
  handler: (async ({ isoCode }: { isoCode: string }) => {
    return executeVoidApiCallWithEmptyOutput((client) =>
      client.deleteLanguageByIsoCode(isoCode, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof deleteLanguageByIsoCodeParams.shape, EmptyOutputShape>;

export default withStandardDecorators(DeleteLanguageTool);
