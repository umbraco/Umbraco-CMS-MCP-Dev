import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getRelationByRelationTypeIdParams, getRelationByRelationTypeIdQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";

const GetRelationByRelationTypeIdTool = CreateUmbracoReadTool(
  "get-relation-by-relation-type-id",
  "Gets relations by relation type ID",
  z.object({
    ...getRelationByRelationTypeIdParams.shape,
    ...getRelationByRelationTypeIdQueryParams.shape,
  }).shape,
  async ({ id, skip, take }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getRelationByRelationTypeId(id, {
      skip,
      take
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

export default GetRelationByRelationTypeIdTool;