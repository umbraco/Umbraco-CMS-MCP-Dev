import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { CreateScriptRequestModel } from "@/umb-management-api/schemas/index.js";
import z from "zod";

const createScriptSchema = z.object({
  name: z.string().min(1, "Name is required"),
  path: z.string().optional(),
  content: z.string().min(1, "Content is required")
});

type CreateScriptSchema = z.infer<typeof createScriptSchema>;

const CreateScriptTool = CreateUmbracoWriteTool(
  "create-script",
  "Creates a new script",
  createScriptSchema.shape,
  async (model: CreateScriptSchema) => {
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
  }
);

export default CreateScriptTool;