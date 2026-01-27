import { deleteLanguageByIsoCodeParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

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
