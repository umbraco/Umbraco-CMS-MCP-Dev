import { getElementFolderByIdReferencedDescendantsParams, getElementFolderByIdReferencedDescendantsQueryParams, getElementFolderByIdReferencedDescendantsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoElementPermissions } from "../constants.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const inputSchema = z.object({
  ...getElementFolderByIdReferencedDescendantsParams.shape,
  ...getElementFolderByIdReferencedDescendantsQueryParams.shape,
});

const GetElementFolderReferencedDescendantsTool = {
  name: "get-element-folder-referenced-descendants",
  description: `Get descendant references for an element folder
  Use this to find all descendant references (child items) that are being referenced for a specific element folder.

  Useful for:
  • Impact analysis: Before deleting an element folder, see what content would be affected
  • Dependency tracking: Find all content using elements from a specific folder hierarchy
  • Content auditing: Identify which descendant element items are actually being used`,
  inputSchema: inputSchema.shape,
  outputSchema: getElementFolderByIdReferencedDescendantsResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['references'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoElementPermissions.Read),
  handler: (async ({ id, skip, take }: z.infer<typeof inputSchema>) => {
    return executeGetApiCall((client) =>
      client.getElementFolderByIdReferencedDescendants(id, { skip, take }, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema.shape, typeof getElementFolderByIdReferencedDescendantsResponse.shape>;

export default withStandardDecorators(GetElementFolderReferencedDescendantsTool);
