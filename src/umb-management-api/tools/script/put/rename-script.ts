import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { RenameScriptRequestModel } from "@/umb-management-api/schemas/index.js";
import { z } from "zod";

const renameScriptSchema = z.object({
  name: z.string().min(1, "Current script name is required"),
  folderPath: z.string().optional().describe("Path to the folder containing the script (optional, leave empty for root)"),
  newName: z.string().min(1, "New script name is required")
});

type RenameScriptSchema = z.infer<typeof renameScriptSchema>;

const RenameScriptTool = CreateUmbracoWriteTool(
  "rename-script",
  "Renames a script by name and folder path",
  renameScriptSchema.shape,
  async (model: RenameScriptSchema) => {
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
  }
);

export default RenameScriptTool;