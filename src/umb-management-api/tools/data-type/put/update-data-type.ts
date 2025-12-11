import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { UpdateDataTypeRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  putDataTypeByIdBody,
  putDataTypeByIdParams,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";

import { z } from "zod";

const UpdateDataTypeTool = CreateUmbracoWriteTool(
  "update-data-type",
  "Updates a data type by Id",
  {
    id: putDataTypeByIdParams.shape.id,
    data: z.object(putDataTypeByIdBody.shape),
  },
  async (model: { id: string; data: UpdateDataTypeRequestModel }) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.putDataTypeById(model.id, model.data);

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

export default UpdateDataTypeTool;
