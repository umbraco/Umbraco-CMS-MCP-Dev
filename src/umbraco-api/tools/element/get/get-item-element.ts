import { getItemElementQueryParams, getItemElementResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umbraco-api/schemas/index.js";
import { UmbracoElementPermissions } from "../constants.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const outputSchema = z.object({
  items: getItemElementResponse,
});

const GetItemElementTool = {
  name: "get-item-element",
  description: "Gets element items by their ids",
  inputSchema: getItemElementQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['list'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoElementPermissions.Read),
  handler: (async (params: z.infer<typeof getItemElementQueryParams>) => {
    return executeGetItemsApiCall((client) =>
      client.getItemElement(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemElementQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetItemElementTool);
