import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import {
  getMediaTypeByIdAllowedChildrenParams,
  getMediaTypeByIdAllowedChildrenQueryParams,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";

// Combine both parameter schemas
const paramSchema = getMediaTypeByIdAllowedChildrenParams.merge(
  getMediaTypeByIdAllowedChildrenQueryParams
);

const GetMediaTypeAllowedChildrenTool = CreateUmbracoReadTool(
  "get-media-type-allowed-children",
  "Gets the media types that are allowed as children of a media type",
  paramSchema.shape,
  async (model) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getMediaTypeByIdAllowedChildren(model.id, {
      skip: model.skip,
      take: model.take,
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

export default GetMediaTypeAllowedChildrenTool;
