import { UmbracoManagementClient } from "@umb-management-client";
import { CreateScriptRequestModel } from "@/umb-management-api/schemas/index.js";
import z from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const createScriptSchema = z.object({
  name: z.string().min(1, "Name is required"),
  path: z.string().optional(),
  content: z.string().min(1, "Content is required")
});

type CreateScriptSchema = z.infer<typeof createScriptSchema>;

const CreateScriptTool = {
  name: "create-script",
  description: "Creates a new script",
  schema: createScriptSchema.shape,
  isReadOnly: false,
  slices: ['create'],
  handler: async (model: CreateScriptSchema) => {
    const client = UmbracoManagementClient.getClient();

    const normalizedPath = model.path && !model.path.startsWith('/')
      ? `/${model.path}`
      : model.path;

    const name = model.name.endsWith('.js')
      ? model.name
      : `${model.name}.js`;

    const payload: CreateScriptRequestModel = {
      name,
      content: model.content,
      parent: normalizedPath ? { path: normalizedPath } : undefined,
    };

    const response = await client.postScript(payload);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof createScriptSchema.shape>;

export default withStandardDecorators(CreateScriptTool);