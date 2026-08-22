import { getElementByIdPublishedParams, getElementByIdPublishedResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umbraco-api/schemas/index.js";
import { UmbracoElementPermissions } from "../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetElementPublishedTool = {
  name: "get-element-published",
  description: "Gets the published version of an element by id. Unlike get-element-by-id, which returns the draft/current version, this returns only the data from the last published version of the element.",
  inputSchema: getElementByIdPublishedParams.shape,
  outputSchema: getElementByIdPublishedResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['read'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoElementPermissions.Read),
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getElementByIdPublished(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getElementByIdPublishedParams.shape, typeof getElementByIdPublishedResponse.shape>;

export default withStandardDecorators(GetElementPublishedTool);
