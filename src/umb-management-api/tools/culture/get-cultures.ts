import { GetCultureParams } from "@/umb-management-api/schemas/index.js";
import { getCultureQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

// Fix: Umbraco returns some cultures with empty name strings, but the generated
// schema has .min(1). Override to allow empty strings.
// TODO: Report to Umbraco CMS — GET /culture returns cultures with empty name field
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
