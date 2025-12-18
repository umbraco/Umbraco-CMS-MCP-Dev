import { UmbracoManagementClient } from "@umb-management-client";
import { CreatePartialViewRequestModel } from "@/umb-management-api/schemas/index.js";
import z from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const createPartialViewSchema = z.object({
  name: z.string().min(1, "Name is required"),
  path: z.string().optional(),
  content: z.string().min(1, "Content is required")
});

type CreatePartialViewSchema = z.infer<typeof createPartialViewSchema>;

const CreatePartialViewTool = {
  name: "create-partial-view",
  description: "Creates a new partial view",
  schema: createPartialViewSchema.shape,
  isReadOnly: false,
  slices: ['create'],
  handler: async (model: CreatePartialViewSchema) => {
    const client = UmbracoManagementClient.getClient();

    const normalizedPath = model.path && !model.path.startsWith('/')
      ? `/${model.path}`
      : model.path;

    const name = model.name.endsWith('.cshtml')
      ? model.name
      : `${model.name}.cshtml`;

    const content = model.content.replace(/(\r\n|\n|\r)/g, "");

    const payload: CreatePartialViewRequestModel = {
      name,
      content,
      parent: normalizedPath ? { path: normalizedPath } : undefined,
    };

    var response = await client.postPartialView(payload);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof createPartialViewSchema.shape>;

export default withStandardDecorators(CreatePartialViewTool);