import { UmbracoManagementClient } from "@umb-management-client";
import { CreateStylesheetRequestModel } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

// Flattened schema - prevents LLM JSON stringification of parent object
const createStylesheetSchema = z.object({
  name: z.string().min(1, "Name is required"),
  path: z.string().optional(),
  content: z.string().min(1, "Content is required")
});

type CreateStylesheetSchema = z.infer<typeof createStylesheetSchema>;

const CreateStylesheetTool = {
  name: "create-stylesheet",
  description: `Creates a new stylesheet.`,
  schema: createStylesheetSchema.shape,
  isReadOnly: false,
  slices: ['create'],
  handler: async (model: CreateStylesheetSchema) => {
    const client = UmbracoManagementClient.getClient();

    // Normalize path to ensure it starts with /
    const normalizedPath = model.path && !model.path.startsWith('/')
      ? `/${model.path}`
      : model.path;

    // Ensure name ends with .css extension
    const name = model.name.endsWith('.css')
      ? model.name
      : `${model.name}.css`;

    // Transform: flat path -> nested parent object for API
    const payload: CreateStylesheetRequestModel = {
      name,
      content: model.content,
      parent: normalizedPath ? { path: normalizedPath } : undefined,
    };

    const response = await client.postStylesheet(payload);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof createStylesheetSchema.shape>;

export default withStandardDecorators(CreateStylesheetTool);