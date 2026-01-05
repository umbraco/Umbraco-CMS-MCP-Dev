import { UmbracoManagementClient } from "@umb-management-client";
import { CreatePartialViewFolderRequestModel, ProblemDetails } from "@/umb-management-api/schemas/index.js";
import { postPartialViewFolderBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult, createToolResultError } from "@/helpers/mcp/tool-decorators.js";
import { AxiosResponse } from "axios";
import { z } from "zod";

export const createPartialViewFolderOutputSchema = z.object({
  message: z.string(),
  path: z.string()
});

const CreatePartialViewFolderTool = {
  name: "create-partial-view-folder",
  description: "Creates a new partial view folder",
  inputSchema: postPartialViewFolderBody.shape,
  outputSchema: createPartialViewFolderOutputSchema.shape,
  slices: ['create', 'folders'],
  handler: (async (model: CreatePartialViewFolderRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postPartialViewFolder(model, {
      returnFullResponse: true,
      validateStatus: () => true,
    }) as unknown as AxiosResponse<ProblemDetails | void>;

    if (response.status === 201) {
      // Extract path from Location header
      const locationHeader = response.headers['location'] || response.headers['Location'];
      let createdPath = '';
      if (locationHeader) {
        // Location header format: /umbraco/management/api/v1/partial-view/folder/{encodedPath}
        const pathMatch = locationHeader.match(/partial-view\/folder\/(.+)$/);
        if (pathMatch) {
          createdPath = decodeURIComponent(pathMatch[1]);
        }
      }
      return createToolResult({
        message: "Partial view folder created successfully",
        path: createdPath
      });
    } else {
      const errorData: ProblemDetails = response.data || {
        status: response.status,
        detail: response.statusText,
      };
      return createToolResultError(errorData);
    }
  }),
} satisfies ToolDefinition<typeof postPartialViewFolderBody.shape, typeof createPartialViewFolderOutputSchema.shape>;

export default withStandardDecorators(CreatePartialViewFolderTool);