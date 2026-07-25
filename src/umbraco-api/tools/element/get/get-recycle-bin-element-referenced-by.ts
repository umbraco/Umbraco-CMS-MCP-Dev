import { getRecycleBinElementReferencedByQueryParams, getRecycleBinElementReferencedByResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umbraco-api/schemas/index.js";
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
  description: `Lists all content that references any deleted element in the recycle bin (not scoped to a specific element).
  Useful before emptying the recycle bin to see what still references deleted elements.`,
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
