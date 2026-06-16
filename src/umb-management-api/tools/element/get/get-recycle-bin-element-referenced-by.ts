import { getRecycleBinElementReferencedByQueryParams, getRecycleBinElementReferencedByResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoElementPermissions } from "../constants.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetRecycleBinElementReferencedByTool = {
  name: "get-recycle-bin-element-referenced-by",
  description: `Get references to deleted element items in the recycle bin
  Use this to find content that still references deleted element items before permanently deleting them.`,
  inputSchema: getRecycleBinElementReferencedByQueryParams.shape,
  outputSchema: getRecycleBinElementReferencedByResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['references', 'recycle-bin'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoElementPermissions.Read),
  handler: (async ({ skip, take }: z.infer<typeof getRecycleBinElementReferencedByQueryParams>) => {
    return executeGetApiCall((client) =>
      client.getRecycleBinElementReferencedBy({ skip, take }, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getRecycleBinElementReferencedByQueryParams.shape, typeof getRecycleBinElementReferencedByResponse.shape>;

export default withStandardDecorators(GetRecycleBinElementReferencedByTool);
