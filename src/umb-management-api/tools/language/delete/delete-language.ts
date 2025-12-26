import { deleteLanguageByIsoCodeParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const DeleteLanguageTool = {
  name: "delete-language",
  description: "Deletes a language by ISO code",
  inputSchema: deleteLanguageByIsoCodeParams.shape,
  annotations: {
    destructiveHint: true,
  },
  slices: ['delete'],
  handler: (async ({ isoCode }: { isoCode: string }) => {
    return executeVoidApiCall((client) =>
      client.deleteLanguageByIsoCode(isoCode, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof deleteLanguageByIsoCodeParams.shape>;

export default withStandardDecorators(DeleteLanguageTool);
