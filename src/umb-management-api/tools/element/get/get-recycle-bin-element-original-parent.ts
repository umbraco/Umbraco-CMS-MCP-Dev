import { getRecycleBinElementByIdOriginalParentParams, getRecycleBinElementByIdOriginalParentResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoElementPermissions } from "../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetRecycleBinElementOriginalParentTool = {
  name: "get-recycle-bin-element-original-parent",
  description: `Get the original parent location of an element item in the recycle bin
  Returns information about where the element item was located before deletion.`,
  inputSchema: getRecycleBinElementByIdOriginalParentParams.shape,
  outputSchema: getRecycleBinElementByIdOriginalParentResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['read', 'recycle-bin'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoElementPermissions.Read),
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getRecycleBinElementByIdOriginalParent(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getRecycleBinElementByIdOriginalParentParams.shape, typeof getRecycleBinElementByIdOriginalParentResponse.shape>;

export default withStandardDecorators(GetRecycleBinElementOriginalParentTool);
