import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { z } from "zod";
import { propertyEditorTemplates, type PropertyEditorTemplate } from "../post/property-editor-templates.js";

// Zod schema for the tool parameters
const propertyEditorTemplateSchema = z.object({
  editorName: z.string().optional().describe("The name of the property editor template to retrieve (e.g., 'Textbox', 'Toggle', 'RichTextEditor_TinyMCE'). If not provided, returns a list of all available property editor names.")
});

type PropertyEditorTemplateParams = z.infer<typeof propertyEditorTemplateSchema>;

const GetDataTypePropertyEditorTemplateTool = CreateUmbracoReadTool(
  "get-data-type-property-editor-template",
  `Retrieves property editor templates for creating data types in Umbraco.

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
  propertyEditorTemplateSchema.shape,
  async (model: PropertyEditorTemplateParams) => {
    try {
      // If no editorName provided, return list of available editors
      if (!model.editorName) {
        const availableEditors = Object.entries(propertyEditorTemplates)
          .map(([name, config]) => {
            const hasNotes = config._notes ? ` (${config._notes})` : '';
            return `- ${name}${hasNotes}`;
          })
          .sort()
          .join('\n');

        return {
          content: [
            {
              type: "text" as const,
              text: `Available Property Editor Templates:\n\n${availableEditors}\n\nUse get-data-type-property-editor-template with a specific editorName to see the full configuration.`,
            },
          ],
        };
      }

      // Look for the specific editor (case-insensitive)
      const editorKey = Object.keys(propertyEditorTemplates).find(
        key => key.toLowerCase() === model.editorName!.toLowerCase()
      );

      if (!editorKey) {
        const availableEditors = Object.keys(propertyEditorTemplates).sort().join(', ');
        return {
          content: [
            {
              type: "text" as const,
              text: `Property editor template '${model.editorName}' not found.\n\nAvailable templates: ${availableEditors}\n\nNote: Editor names are case-insensitive.`,
            },
          ],
          isError: true,
        };
      }

      const template = propertyEditorTemplates[editorKey];

      // Build a helpful response with the template
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

      return {
        content: [
          {
            type: "text" as const,
            text: response,
          },
        ],
      };
    } catch (error) {
      console.error('Error reading property editor templates:', error);
      return {
        content: [
          {
            type: "text" as const,
            text: `Error reading property editor templates: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

export default GetDataTypePropertyEditorTemplateTool;
