import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { UpdatePartialViewRequestModel } from "@/umb-management-api/schemas/index.js";
import { putPartialViewByPathParams, putPartialViewByPathBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";

const UpdatePartialViewTool = CreateUmbracoWriteTool(
  "update-partial-view",
  "Updates a partial view",
  z.object({
    ...putPartialViewByPathParams.shape,
    ...putPartialViewByPathBody.shape,
  }).shape,
  async (model: { path: string } & UpdatePartialViewRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    const { path, ...updateModel } = model;
    var response = await client.putPartialViewByPath(path, updateModel);

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

export default UpdatePartialViewTool;