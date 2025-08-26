import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/create-umbraco-tool.js";
import { putRecycleBinMediaByIdRestoreParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const RestoreFromRecycleBinTool = CreateUmbracoTool(
  "restore-media-from-recycle-bin",
  "Restores a media item from the recycle bin.",
  putRecycleBinMediaByIdRestoreParams.shape,
  async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putRecycleBinMediaByIdRestore(id, {
      target: null,
    });
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

export default RestoreFromRecycleBinTool;
