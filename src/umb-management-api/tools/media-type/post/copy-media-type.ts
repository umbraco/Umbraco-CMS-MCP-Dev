import { UmbracoManagementClient } from "@umb-management-client";
import { postMediaTypeByIdCopyBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { CopyMediaTypeRequestModel, ProblemDetails } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult, createToolResultError } from "@/helpers/mcp/tool-decorators.js";
import { AxiosResponse } from "axios";

const inputSchema = z.object({
  id: z.string().uuid(),
  data: z.object(postMediaTypeByIdCopyBody.shape),
});

export const copyMediaTypeOutputSchema = z.object({
  message: z.string(),
  id: z.string().uuid()
});

const CopyMediaTypeTool = {
  name: "copy-media-type",
  description: "Copy a media type to a new location",
  inputSchema: inputSchema.shape,
  outputSchema: copyMediaTypeOutputSchema.shape,
  slices: ['copy'],
  handler: (async (model: { id: string; data: CopyMediaTypeRequestModel }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postMediaTypeByIdCopy(model.id, model.data, {
      returnFullResponse: true,
      validateStatus: () => true,
    }) as unknown as AxiosResponse<ProblemDetails | void>;

    if (response.status === 201) {
      // Extract ID from Location header
      const locationHeader = response.headers['location'] || response.headers['Location'];
      let createdId = '';
      if (locationHeader) {
        const idMatch = locationHeader.match(/([0-9a-f-]{36})$/i);
        if (idMatch) {
          createdId = idMatch[1];
        }
      }
      return createToolResult({
        message: "Media type copied successfully",
        id: createdId
      });
    } else {
      const errorData: ProblemDetails = response.data || {
        status: response.status,
        detail: response.statusText,
      };
      return createToolResultError(errorData);
    }
  }),
} satisfies ToolDefinition<typeof inputSchema.shape, typeof copyMediaTypeOutputSchema.shape>;

export default withStandardDecorators(CopyMediaTypeTool);
