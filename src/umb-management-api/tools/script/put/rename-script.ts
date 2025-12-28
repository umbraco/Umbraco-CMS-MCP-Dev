import { UmbracoManagementClient } from "@umb-management-client";
import { RenameScriptRequestModel } from "@/umb-management-api/schemas/index.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const renameScriptSchema = z.object({
  name: z.string().min(1, "Current script name is required"),
  folderPath: z.string().optional().describe("Path to the folder containing the script (optional, leave empty for root)"),
  newName: z.string().min(1, "New script name is required")
});

type RenameScriptSchema = z.infer<typeof renameScriptSchema>;

const RenameScriptTool = {
  name: "rename-script",
  description: "Renames a script by name and folder path",
  schema: renameScriptSchema.shape,
  isReadOnly: false,
  slices: ['rename'],
  handler: async (model: RenameScriptSchema) => {
    const client = UmbracoManagementClient.getClient();

    // Ensure script names have .js extension
    const currentName = model.name.endsWith('.js') ? model.name : `${model.name}.js`;
    const newName = model.newName.endsWith('.js') ? model.newName : `${model.newName}.js`;

    // Construct the full path for the current script
    const normalizedFolderPath = model.folderPath && !model.folderPath.startsWith('/')
      ? `/${model.folderPath}`
      : model.folderPath;

    const fullPath = normalizedFolderPath
      ? `${normalizedFolderPath}/${currentName}`
      : `/${currentName}`;

    // URL encode the path to handle forward slashes properly
    const encodedPath = encodeURIComponent(fullPath);

    const renameModel: RenameScriptRequestModel = {
      name: newName
    };

    const response = await client.putScriptByPathRename(encodedPath, renameModel);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof renameScriptSchema.shape>;

export default withStandardDecorators(RenameScriptTool);