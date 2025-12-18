import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";
import { FOLDER_MEDIA_TYPE_ID } from "@/constants/constants.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const createMediaFolderSchema = z.object({
  name: z.string().describe("The name of the folder"),
  parentId: z.string().uuid().optional().describe("Parent folder ID. If not provided, the folder will be created at the root of the media library."),
});

type CreateMediaFolderParams = z.infer<typeof createMediaFolderSchema>;

const CreateMediaFolderTool = {
  name: "create-media-folder",
  description: "Creates a new folder in the media library. Use this to organize media items into folders. For uploading actual media files (images, documents, etc.), use the create-media tool instead.",
  schema: createMediaFolderSchema.shape,
  isReadOnly: false,
  slices: ['create', 'folders'],
  handler: async (model: CreateMediaFolderParams) => {
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
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `Media folder "${model.name}" created successfully`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error creating media folder: ${(error as Error).message}`,
          },
        ],
        isError: true,
      };
    }
  },
} satisfies ToolDefinition<typeof createMediaFolderSchema.shape>;

export default withStandardDecorators(CreateMediaFolderTool);
