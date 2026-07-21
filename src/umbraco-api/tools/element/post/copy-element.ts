import { z } from "zod";
import { UmbracoManagementClient } from "@umb-management-client";
import { CopyElementRequestModel, CurrentUserResponseModel, ProblemDetails } from "@/umbraco-api/schemas/index.js";
import { UmbracoElementPermissions } from "../constants.js";
import {
  type ToolDefinition,
  createToolResult,
  createToolResultError,
  withStandardDecorators,
  type HttpResponse,
} from "@umbraco-cms/mcp-server-sdk";

const copyElementSchema = z.object({
  parentId: z.string().uuid("Must be a valid element UUID of the parent node").optional(),
  idToCopy: z.string().uuid("Must be a valid element UUID to copy"),
});

export const copyElementOutputSchema = z.object({
  id: z.string().guid()
});

const CopyElementTool = {
  name: "copy-element",
  description: `Copy an element to a new location. Returns the new element's ID on success.
  This is also the recommended way to create new elements.
  Copy an existing element to preserve the complex JSON structure, then modify specific fields as needed.

  WORKFLOW NOTES:
  - The copy is created as a draft with the naming pattern "Original Name (N)" where N is a number
  - Use the returned ID for subsequent update and publish operations

  Example workflows:
  1. Copy only: copy-element (creates draft copy, returns new ID)
  2. Copy and update: copy-element → update-element → publish-element`,
  inputSchema: copyElementSchema.shape,
  outputSchema: copyElementOutputSchema.shape,
  slices: ['copy'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoElementPermissions.Duplicate),
  handler: (async (model: z.infer<typeof copyElementSchema>) => {
    const client = UmbracoManagementClient.getClient();

    const payload: CopyElementRequestModel = {
      target: model.parentId ? {
        id: model.parentId,
      } : undefined,
    };

    const response = await client.postElementByIdCopy(model.idToCopy, payload, {
      returnFullResponse: true,
      validateStatus: () => true,
    }) as unknown as HttpResponse<ProblemDetails | void>;

    if (response.status === 201) {
      // Extract new ID from Location header: /umbraco/management/api/v1/element/{guid}
      const location = response.headers?.location || '';
      const newId = location.split('/').pop() || '';

      const output = { id: newId };
      return createToolResult(output);
    } else {
      const errorData: ProblemDetails = response.data || {
        status: response.status,
        detail: response.statusText,
      };
      return createToolResultError(errorData);
    }
  }),
} satisfies ToolDefinition<typeof copyElementSchema.shape, typeof copyElementOutputSchema.shape>;

export default withStandardDecorators(CopyElementTool);
