import { putElementVersionByIdPreventCleanupParams, putElementVersionByIdPreventCleanupQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoElementPermissions } from "../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

// Combined schema for both path params and query params
const setElementVersionPreventCleanupSchema = putElementVersionByIdPreventCleanupParams.merge(
  putElementVersionByIdPreventCleanupQueryParams
);

type SchemaParams = z.infer<typeof setElementVersionPreventCleanupSchema>;

const SetElementVersionPreventCleanupTool = {
  name: "set-element-version-prevent-cleanup",
  description: "Prevent cleanup for a specific element version",
  inputSchema: setElementVersionPreventCleanupSchema.shape,
  annotations: {
    idempotentHint: true,
  },
  slices: ['update'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoElementPermissions.Update),
  handler: (async ({ id, preventCleanup }: SchemaParams) => {
    return executeVoidApiCall((client) =>
      client.putElementVersionByIdPreventCleanup(id, { preventCleanup }, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof setElementVersionPreventCleanupSchema.shape>;

export default withStandardDecorators(SetElementVersionPreventCleanupTool);
