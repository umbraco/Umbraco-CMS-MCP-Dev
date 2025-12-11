import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getCollectionMediaQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetCollectionMediaTool = CreateUmbracoReadTool(
  "get-collection-media",
  `Get a collection of media items
  Use this to retrieve a filtered and paginated collection of media items based on various criteria like data type, ordering, and filtering.`,
  getCollectionMediaQueryParams.shape,
  async ({ id, dataTypeId, orderBy, orderDirection, filter, skip, take }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getCollectionMedia({
      id,
      dataTypeId,
      orderBy,
      orderDirection,
      filter,
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

export default GetCollectionMediaTool;