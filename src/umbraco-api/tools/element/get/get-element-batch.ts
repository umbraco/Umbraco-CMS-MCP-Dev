import { GetElementBatchParams } from "@/umbraco-api/schemas/index.js";
import { getElementBatchQueryParams, getElementBatchResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umbraco-api/schemas/index.js";
import { UmbracoElementPermissions } from "../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetElementBatchTool = {
  name: "get-element-batch",
  description: `Gets full elements for multiple Ids in one call.
  Returns each element's values, variants and document type,
  not just the lightweight item shape returned by get-item-element.
  Use when you need the same payload as get-element-by-id but for many Ids at once.
  Ids the current user is not allowed to access are silently omitted.`,
  inputSchema: getElementBatchQueryParams.shape,
  outputSchema: getElementBatchResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['list'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoElementPermissions.Read),
  handler: (async (params: GetElementBatchParams) => {
    return executeGetApiCall((client) =>
      client.getElementBatch(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getElementBatchQueryParams.shape, typeof getElementBatchResponse.shape>;

export default withStandardDecorators(GetElementBatchTool);
