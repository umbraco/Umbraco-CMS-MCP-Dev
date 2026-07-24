import {
  putElementByIdUpdateAndPublishParams,
  putElementByIdUpdateAndPublishBody,
} from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umbraco-api/schemas/index.js";
import { UmbracoElementPermissions } from "../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const inputSchema = {
  id: putElementByIdUpdateAndPublishParams.shape.id,
  data: z.object(putElementByIdUpdateAndPublishBody.shape),
};

const UpdateAndPublishElementTool = {
  name: "update-and-publish-element",
  description: `Updates an element by Id and publishes it in a single operation.

  ### Cultures To Publish
  - culturesToPublish controls which of the element's variants get published.
  - Umbraco only accepts real culture codes here - wildcards ("*") and nulls are rejected with an error.
  - When the element does not vary by culture (invariant content), pass an empty array \`[]\` to publish the single invariant variant.
  - When the element varies by culture, provide the culture codes of the variants you want published.

  If you must use this tool:
  - Always read the current element first with get-element-by-id.
  - Send the full set of values AND variants — they are replaced wholesale, so any value or variant you omit is removed.
  - Include one variant entry per existing culture; do not drop variants you aren't changing.`,
  inputSchema: inputSchema,
  annotations: {
    idempotentHint: true,
  },
  slices: ['update'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoElementPermissions.Publish),
  handler: (async (model: { id: string; data: any }) => {
    return executeVoidApiCall((client) =>
      client.putElementByIdUpdateAndPublish(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema>;

export default withStandardDecorators(UpdateAndPublishElementTool);
