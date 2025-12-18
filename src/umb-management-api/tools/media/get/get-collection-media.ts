import { UmbracoManagementClient } from "@umb-management-client";
import { getCollectionMediaQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

type GetCollectionMediaParams = z.infer<typeof getCollectionMediaQueryParams>;

const GetCollectionMediaTool = {
  name: "get-collection-media",
  description: `Get a collection of media items
  Use this to retrieve a filtered and paginated collection of media items based on various criteria like data type, ordering, and filtering.`,
  schema: getCollectionMediaQueryParams.shape,
  isReadOnly: true,
  slices: ['list'],
  handler: async ({ id, dataTypeId, orderBy, orderDirection, filter, skip, take }: GetCollectionMediaParams) => {
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
  },
} satisfies ToolDefinition<typeof getCollectionMediaQueryParams.shape>;

export default withStandardDecorators(GetCollectionMediaTool);