import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getCollectionDocumentByIdParams, getCollectionDocumentByIdQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";

const GetCollectionDocumentByIdTool = CreateUmbracoReadTool(
  "get-collection-document-by-id",
  `Get a collection of document items
  Use this to retrieve a filtered and paginated collection of document items based on various criteria like data type, ordering, and filtering.`,
  z.object({
    ...getCollectionDocumentByIdParams.shape,
    ...getCollectionDocumentByIdQueryParams.shape,
  }).shape,
  async ({ id, dataTypeId, orderBy, orderDirection, filter, skip, take }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getCollectionDocumentById(id, {
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

export default GetCollectionDocumentByIdTool;