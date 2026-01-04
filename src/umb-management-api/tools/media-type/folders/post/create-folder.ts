import { UmbracoManagementClient } from "@umb-management-client";
import { CreateFolderRequestModel, ProblemDetails } from "@/umb-management-api/schemas/index.js";
import { postMediaTypeFolderBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult, createToolResultError } from "@/helpers/mcp/tool-decorators.js";
import { AxiosResponse } from "axios";

export const createMediaTypeFolderOutputSchema = z.object({
  message: z.string(),
  id: z.string().uuid()
});

const CreateMediaTypeFolderTool = {
  name: "create-media-type-folder",
  description: "Creates a new media type folder",
  inputSchema: postMediaTypeFolderBody.shape,
  outputSchema: createMediaTypeFolderOutputSchema.shape,
  slices: ['create', 'folders'],
  handler: (async (model: CreateFolderRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postMediaTypeFolder(model, {
      returnFullResponse: true,
      validateStatus: () => true,
    }) as unknown as AxiosResponse<ProblemDetails | void>;

    if (response.status === 201) {
      // Extract ID from Location header
      const locationHeader = response.headers['location'] || response.headers['Location'];
      let createdId = model.id || '';
      if (locationHeader) {
        const idMatch = locationHeader.match(/([0-9a-f-]{36})$/i);
        if (idMatch) {
          createdId = idMatch[1];
        }
      }
      return createToolResult({
        message: "Media type folder created successfully",
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
} satisfies ToolDefinition<typeof postMediaTypeFolderBody.shape, typeof createMediaTypeFolderOutputSchema.shape>;

export default withStandardDecorators(CreateMediaTypeFolderTool);
