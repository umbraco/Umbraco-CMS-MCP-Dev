import { getElementAreReferencedQueryParams, getElementAreReferencedResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umbraco-api/schemas/index.js";
import { UmbracoElementPermissions } from "../constants.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetElementAreReferencedTool = {
  name: "get-element-are-referenced",
  description: `Check if element items are referenced
  Use this to verify if specific element items are being referenced by other content before deletion or modification.`,
  inputSchema: getElementAreReferencedQueryParams.shape,
  outputSchema: getElementAreReferencedResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['references'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoElementPermissions.Read),
  handler: (async ({ id, skip, take }: z.infer<typeof getElementAreReferencedQueryParams>) => {
    return executeGetApiCall((client) =>
      client.getElementAreReferenced({ id, skip, take }, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getElementAreReferencedQueryParams.shape, typeof getElementAreReferencedResponse.shape>;

export default withStandardDecorators(GetElementAreReferencedTool);
