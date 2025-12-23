import { z } from "zod";
import { propertyEditorTemplates } from "../post/property-editor-templates.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult, createToolResultError } from "@/helpers/mcp/tool-decorators.js";

// Zod schema for the tool parameters
const propertyEditorTemplateSchema = z.object({
  editorName: z.string().optional().describe("The name of the property editor template to retrieve (e.g., 'Textbox', 'Toggle', 'RichTextEditor_TinyMCE'). If not provided, returns a list of all available property editor names.")
});

type PropertyEditorTemplateParams = z.infer<typeof propertyEditorTemplateSchema>;

// Zod schema for PropertyEditorTemplate structure
const propertyEditorTemplateValueSchema = z.object({
  alias: z.string(),
  value: z.any().optional(),
});

const propertyEditorTemplateItemSchema = z.object({
  editorAlias: z.string().optional(),
  editorUiAlias: z.string().optional(),
  values: z.array(propertyEditorTemplateValueSchema).optional(),
  _notes: z.string().optional(),
});

// Output schema: union of available editors list or specific template
const propertyEditorTemplateOutputSchema = z.union([
  z.object({
    type: z.literal("list"),
    availableEditors: z.array(z.object({
      name: z.string(),
      notes: z.string().optional(),
    })),
  }),
  z.object({
    type: z.literal("template"),
    name: z.string(),
    template: propertyEditorTemplateItemSchema,
  }),
]);

const GetDataTypePropertyEditorTemplateTool = {
  name: "get-data-type-property-editor-template",
  description: `Retrieves property editor templates for creating data types in Umbraco.

IMPORTANT: This tool should be used BEFORE creating data types to understand:
- What property editors are available
- The required configuration structure for each property editor
- Example values that can be customized for your needs

Usage:
1. Call without parameters to see all available property editor names
2. Call with a specific editorName to get the full configuration template for that property editor
3. Use the returned template as a starting point when creating new data types with create-data-type

The templates include:
- editorAlias: The internal Umbraco editor identifier (required)
- editorUiAlias: The UI component identifier (required)
- values: An array of configuration options with example values
- _notes: Important information about special requirements or options

Note: Some templates (like BlockList, BlockGrid) have _notes indicating you must create element types first before creating the data type.`,
  inputSchema: propertyEditorTemplateSchema.shape,
  outputSchema: propertyEditorTemplateOutputSchema,
  annotations: {
    readOnlyHint: true
  },
  slices: ['templates'],
  handler: (async (model: PropertyEditorTemplateParams) => {
    // If no editorName provided, return list of available editors
    if (!model.editorName) {
      const availableEditors = Object.entries(propertyEditorTemplates)
        .map(([name, config]) => ({
          name,
          notes: config._notes,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      const structuredOutput = {
        type: "list" as const,
        availableEditors,
      };

      const text = `Available Property Editor Templates:\n\n${availableEditors.map(e => `- ${e.name}${e.notes ? ` (${e.notes})` : ''}`).join('\n')}\n\nUse get-data-type-property-editor-template with a specific editorName to see the full configuration.`;
      
      return createToolResult(structuredOutput);
    }

    // Look for the specific editor (case-insensitive)
    const editorKey = Object.keys(propertyEditorTemplates).find(
      key => key.toLowerCase() === model.editorName!.toLowerCase()
    );

    if (!editorKey) {
      const availableEditors = Object.keys(propertyEditorTemplates).sort().join(', ');
      const errorData = {
        title: "Property editor template not found",
        detail: `Property editor template '${model.editorName}' not found. Available templates: ${availableEditors}. Note: Editor names are case-insensitive.`,
        availableTemplates: Object.keys(propertyEditorTemplates).sort()
      };
      return createToolResultError(errorData);
    }

    const template = propertyEditorTemplates[editorKey];

    const structuredOutput = {
      type: "template" as const,
      name: editorKey,
      template: {
        editorAlias: template.editorAlias,
        editorUiAlias: template.editorUiAlias,
        values: template.values,
        _notes: template._notes,
      },
    };

    // Build a helpful text response
    let response = `Property Editor Template: ${editorKey}\n\n`;

    if (template._notes) {
      response += `IMPORTANT NOTES:\n${template._notes}\n\n`;
    }

    response += `Configuration:\n${JSON.stringify(template, null, 2)}\n\n`;

    response += `Usage with create-data-type:\n`;
    response += `When creating a data type with this property editor, use:\n`;
    response += `- editorAlias: "${template.editorAlias}"\n`;
    response += `- editorUiAlias: "${template.editorUiAlias}"\n`;
    if (template.values && template.values.length > 0) {
      response += `- values: Customize the values array based on your requirements\n`;
    }

    return createToolResult(structuredOutput);
  }),
} satisfies ToolDefinition<typeof propertyEditorTemplateSchema.shape, typeof propertyEditorTemplateOutputSchema>;

export default withStandardDecorators(GetDataTypePropertyEditorTemplateTool);
