import { getElementByIdParams, getElementByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoElementPermissions } from "../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetElementByIdTool = {
  name: "get-element-by-id",
  description: "Gets an element by id",
  inputSchema: getElementByIdParams.shape,
  outputSchema: getElementByIdResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['read'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoElementPermissions.Read),
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getElementById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getElementByIdParams.shape, typeof getElementByIdResponse.shape>;

export default withStandardDecorators(GetElementByIdTool);
