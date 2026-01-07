import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";
import { FOLDER_MEDIA_TYPE_ID } from "@/constants/constants.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult, createToolResultError, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const createMediaFolderSchema = z.object({
  name: z.string().describe("The name of the folder"),
  parentId: z.string().uuid().optional().describe("Parent folder ID. If not provided, the folder will be created at the root of the media library."),
});

type CreateMediaFolderParams = z.infer<typeof createMediaFolderSchema>;

export const createMediaFolderOutputSchema = z.object({
  message: z.string(),
  name: z.string(),
  id: z.string().uuid()
});

const CreateMediaFolderTool = {
  name: "create-media-folder",
  description: "Creates a new folder in the media library. Use this to organize media items into folders. For uploading actual media files (images, documents, etc.), use the create-media tool instead.",
  inputSchema: createMediaFolderSchema.shape,
  outputSchema: createMediaFolderOutputSchema.shape,
  slices: ['create', 'folders'],
  handler: (async (model: CreateMediaFolderParams) => {
    try {
      const client = UmbracoManagementClient.getClient();

      const response = await client.postMedia({
        values: [],
        variants: [
          {
            culture: null,
            segment: null,
            name: model.name,
          },
        ],
        parent: model.parentId ? { id: model.parentId } : null,
        mediaType: { id: FOLDER_MEDIA_TYPE_ID },
      }, CAPTURE_RAW_HTTP_RESPONSE);

      // Check if request was successful (status 200-299)
      if (response.status < 200 || response.status >= 300) {
        throw new Error(`Request failed with status code ${response.status}`);
      }

      // Extract ID from Location header (standard REST pattern)
      const locationHeader = response.headers?.location || response.headers?.Location;
      if (!locationHeader) {
        throw new Error("No Location header in response - cannot determine created folder ID");
      }

      // Location header format: /umbraco/management/api/v1/media/{id}
      const idMatch = locationHeader.match(/\/([a-f0-9-]{36})$/i);
      if (!idMatch) {
        throw new Error(`Could not extract ID from Location header: ${locationHeader}`);
      }

      const folderId = idMatch[1];

      return createToolResult({
        message: `Media folder "${model.name}" created successfully`,
        name: model.name,
        id: folderId
      });
    } catch (error) {
      return createToolResultError({
        detail: `Error creating media folder: ${(error as Error).message}`,
      });
    }
  }),
} satisfies ToolDefinition<typeof createMediaFolderSchema.shape, typeof createMediaFolderOutputSchema.shape>;

export default withStandardDecorators(CreateMediaFolderTool);
