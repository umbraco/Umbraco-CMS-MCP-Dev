import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { UpdateStylesheetRequestModel } from "@/umb-management-api/schemas/index.js";
import { putStylesheetByPathParams, putStylesheetByPathBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";

const UpdateStylesheetTool = CreateUmbracoWriteTool(
  "update-stylesheet",
  "Updates a stylesheet by path",
  z.object({
    ...putStylesheetByPathParams.shape,
    ...putStylesheetByPathBody.shape,
  }).shape,
  async (model: { path: string } & UpdateStylesheetRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    const { path, ...updateModel } = model;
    var response = await client.putStylesheetByPath(path, updateModel);

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

export default UpdateStylesheetTool;