import {
  getLanguageByIsoCodeParams,
  getLanguageByIsoCodeResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetLanguageByIsoCodeTool = {
  name: "get-language-by-iso-code",
  description: "Gets a language by ISO code",
  inputSchema: getLanguageByIsoCodeParams.shape,
  outputSchema: getLanguageByIsoCodeResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['read'],
  handler: (async ({ isoCode }: { isoCode: string }) => {
    return executeGetApiCall((client) =>
      client.getLanguageByIsoCode(isoCode, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getLanguageByIsoCodeParams.shape, typeof getLanguageByIsoCodeResponse.shape>;

export default withStandardDecorators(GetLanguageByIsoCodeTool);
