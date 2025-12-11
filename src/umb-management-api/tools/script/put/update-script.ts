import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { UpdateScriptRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  putScriptByPathBody,
  putScriptByPathParams,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";

import { z } from "zod";

const UpdateScriptTool = CreateUmbracoWriteTool(
  "update-script",
  "Updates a script by path",
  {
    path: putScriptByPathParams.shape.path,
    data: z.object(putScriptByPathBody.shape),
  },
  async (model: { path: string; data: UpdateScriptRequestModel }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putScriptByPath(model.path, model.data);

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

export default UpdateScriptTool;