import { GetCultureParams } from "@/umbraco-api/schemas/index.js";
import { getCultureQueryParams } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

// WORKAROUND: Umbraco returns some cultures with empty name strings, but the generated
// schema has .min(1). Override to allow empty strings.
// Fixed in Umbraco 17.4 — remove this override and revert to getCultureResponse.shape after upgrade.
const outputSchema = z.object({
  total: z.number(),
  items: z.array(z.object({
    name: z.string(),
    englishName: z.string(),
  })),
});

const GetCulturesTool = {
  name: "get-culture",
  description: "Retrieves a paginated list of cultures that Umbraco can be configured to use",
  inputSchema: getCultureQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['list'],
  handler: (async (params: GetCultureParams) => {
    return executeGetApiCall((client) =>
      client.getCulture(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getCultureQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetCulturesTool);
