import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { RenamePartialViewRequestModel } from "@/umb-management-api/schemas/index.js";
import { putPartialViewByPathRenameParams, putPartialViewByPathRenameBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";

const RenamePartialViewTool = CreateUmbracoWriteTool(
  "rename-partial-view",
  `Renames a partial view`,
  z.object({
    ...putPartialViewByPathRenameParams.shape,
    ...putPartialViewByPathRenameBody.shape,
  }).shape,
  async (model: { path: string } & RenamePartialViewRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    const { path, ...renameModel } = model;
    
    // URL encode the path to handle forward slashes properly
    const normalizedPath = encodeURIComponent(path);
    
    var response = await client.putPartialViewByPathRename(normalizedPath, renameModel);

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

export default RenamePartialViewTool;