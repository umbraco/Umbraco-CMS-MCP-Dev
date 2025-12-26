import {
  getItemLanguageQueryParams,
  getItemLanguageResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";
import { GetItemLanguageParams } from "@/umb-management-api/schemas/index.js";

const outputSchema = z.object({
  items: getItemLanguageResponse,
});

const GetLanguageItemsTool = {
  name: "get-language-items",
  description: "Gets language items (optionally filtered by isoCode)",
  inputSchema: getItemLanguageQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['list'],
  handler: (async (params: GetItemLanguageParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemLanguage(params);
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<typeof getItemLanguageQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetLanguageItemsTool);
