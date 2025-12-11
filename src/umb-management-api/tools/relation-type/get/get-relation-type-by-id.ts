import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getRelationTypeByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetRelationTypeByIdTool = CreateUmbracoReadTool(
  "get-relation-type-by-id",
  "Gets a relation type by Id",
  getRelationTypeByIdParams.shape,
  async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getRelationTypeById(id);

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

export default GetRelationTypeByIdTool;