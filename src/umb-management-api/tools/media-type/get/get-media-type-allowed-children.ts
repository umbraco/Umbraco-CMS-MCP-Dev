import { UmbracoManagementClient } from "@umb-management-client";
import {
  getMediaTypeByIdAllowedChildrenParams,
  getMediaTypeByIdAllowedChildrenQueryParams,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

// Combine both parameter schemas
const paramSchema = getMediaTypeByIdAllowedChildrenParams.merge(
  getMediaTypeByIdAllowedChildrenQueryParams
);

const GetMediaTypeAllowedChildrenTool = {
  name: "get-media-type-allowed-children",
  description: "Gets the media types that are allowed as children of a media type",
  schema: paramSchema.shape,
  isReadOnly: true,
  slices: ['configuration'],
  handler: async (model) => {
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
  },
} satisfies ToolDefinition<typeof paramSchema.shape>;

export default withStandardDecorators(GetMediaTypeAllowedChildrenTool);
