import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { GetRelationTypeParams } from "@/umb-management-api/schemas/index.js";
import { getRelationTypeQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetRelationTypeTool = CreateUmbracoReadTool(
  "get-relation-type",
  "Gets all relation types with pagination",
  getRelationTypeQueryParams.shape,
  async (model: GetRelationTypeParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getRelationType(model);

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

export default GetRelationTypeTool;