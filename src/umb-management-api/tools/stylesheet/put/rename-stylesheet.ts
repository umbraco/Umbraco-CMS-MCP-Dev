import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { RenameStylesheetRequestModel } from "@/umb-management-api/schemas/index.js";
import { putStylesheetByPathRenameParams, putStylesheetByPathRenameBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";

const RenameStylesheetTool = CreateUmbracoWriteTool(
  "rename-stylesheet",
  `Renames a stylesheet`,
  z.object({
    ...putStylesheetByPathRenameParams.shape,
    ...putStylesheetByPathRenameBody.shape,
  }).shape,
  async (model: { path: string } & RenameStylesheetRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    const { path, ...renameModel } = model;
    
    // URL encode the path to handle forward slashes properly
    const normalizedPath = encodeURIComponent(path);
    
    var response = await client.putStylesheetByPathRename(normalizedPath, renameModel);

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

export default RenameStylesheetTool;