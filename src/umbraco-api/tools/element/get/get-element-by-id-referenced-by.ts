import { getElementByIdReferencedByParams, getElementByIdReferencedByQueryParams, getElementByIdReferencedByResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umbraco-api/schemas/index.js";
import { UmbracoElementPermissions } from "../constants.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const inputSchema = z.object({
  ...getElementByIdReferencedByParams.shape,
  ...getElementByIdReferencedByQueryParams.shape,
});

const GetElementByIdReferencedByTool = {
  name: "get-element-by-id-referenced-by",
  description: `Get items that reference a specific element item
  Use this to find all content, documents, or other items that are currently referencing a specific element item.`,
  inputSchema: inputSchema.shape,
  outputSchema: getElementByIdReferencedByResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['references'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoElementPermissions.Read),
  handler: (async ({ id, skip, take }: z.infer<typeof inputSchema>) => {
    return executeGetApiCall((client) =>
      client.getElementByIdReferencedBy(id, { skip, take }, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema.shape, typeof getElementByIdReferencedByResponse.shape>;

export default withStandardDecorators(GetElementByIdReferencedByTool);
