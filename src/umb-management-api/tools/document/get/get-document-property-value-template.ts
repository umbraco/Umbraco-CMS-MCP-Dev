import { z } from "zod";
import { propertyValueTemplates, type PropertyValueTemplate } from "../post/property-value-templates.js";
import {
  type ToolDefinition,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

// Zod schema for the tool parameters
const propertyValueTemplateSchema = z.object({
  editorAlias: z.string().optional().describe("The editor alias of the property value template to retrieve (e.g., 'Umbraco.TextBox', 'Umbraco.BlockList', 'Umbraco.MediaPicker3'). If not provided, returns a list of all available property editor aliases.")
});

type PropertyValueTemplateParams = z.infer<typeof propertyValueTemplateSchema>;

const GetDocumentPropertyValueTemplateTool = {
  name: "get-document-property-value-template",
  description: `Retrieves property value templates for creating documents in Umbraco.

IMPORTANT: This tool should be used BEFORE creating documents to understand:
- What property editors are available
- The required value structure for each property editor
- Example values that can be customized for your needs

Usage:
1. Call without parameters to see all available property editor aliases
2. Call with a specific editorAlias to get the full value template for that property editor
3. Use the returned template as a starting point when creating document property values with create-document

The templates include:
- editorAlias: The property editor identifier (required in create-document values array)
- value: Example value structure showing the expected format
- _notes: Important information about special requirements (IDs, temporary files, etc.)

IMPORTANT: Templates only provide editorAlias and value structure. When using with create-document, you must also provide:
- culture: The culture code or null
- segment: The segment or null
- alias: The property alias from your document type

Note: Some templates (BlockList, BlockGrid, ImageCropper, UploadField) have special requirements indicated in their _notes.`,
  inputSchema: propertyValueTemplateSchema.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['read'],
  handler: (async (model: PropertyValueTemplateParams) => {
    try {
      // If no editorAlias provided, return list of available editors
      if (!model.editorAlias) {
        const availableEditors = Object.entries(propertyValueTemplates)
          .map(([name, config]) => {
            const hasNotes = config._notes ? ` (IMPORTANT: ${config._notes.substring(0, 50)}${config._notes.length > 50 ? '...' : ''})` : '';
            return `- ${name} (${config.editorAlias})${hasNotes}`;
          })
          .sort()
          .join('\n');

        return {
          content: [
            {
              type: "text" as const,
              text: `Available Property Value Templates:\n\n${availableEditors}\n\nUse get-document-property-value-template with a specific editorAlias to see the full value structure.`,
            },
          ],
        };
      }

      // Look for the specific editor by editorAlias (case-insensitive)
      const editorKey = Object.keys(propertyValueTemplates).find(
        key => propertyValueTemplates[key].editorAlias.toLowerCase() === model.editorAlias!.toLowerCase()
      );

      if (!editorKey) {
        // Also try matching by template name
        const editorKeyByName = Object.keys(propertyValueTemplates).find(
          key => key.toLowerCase() === model.editorAlias!.toLowerCase()
        );

        if (!editorKeyByName) {
          const availableAliases = Object.values(propertyValueTemplates)
            .map(t => t.editorAlias)
            .sort()
            .join(', ');
          return {
            content: [
              {
                type: "text" as const,
                text: `Property value template with editorAlias '${model.editorAlias}' not found.\n\nAvailable editor aliases: ${availableAliases}\n\nNote: Matching is case-insensitive. You can also use the template name (e.g., 'Textbox' instead of 'Umbraco.TextBox').`,
              },
            ],
            isError: true,
          };
        }

        // Use the name match
        const template = propertyValueTemplates[editorKeyByName];
        return buildTemplateResponse(editorKeyByName, template);
      }

      const template = propertyValueTemplates[editorKey];
      return buildTemplateResponse(editorKey, template);

    } catch (error) {
      console.error('Error reading property value templates:', error);
      return {
        content: [
          {
            type: "text" as const,
            text: `Error reading property value templates: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }),
} satisfies ToolDefinition<typeof propertyValueTemplateSchema.shape>;

function buildTemplateResponse(editorKey: string, template: PropertyValueTemplate) {
  let response = `Property Value Template: ${editorKey}\n\n`;

  if (template._notes) {
    response += `IMPORTANT NOTES:\n${template._notes}\n\n`;
  }

  response += `Template:\n${JSON.stringify({ editorAlias: template.editorAlias, value: template.value }, null, 2)}\n\n`;

  response += `Usage with create-document:\n`;
  response += `When creating a document with this property, include in the values array:\n`;
  response += `{\n`;
  response += `  "editorAlias": "${template.editorAlias}",  // From template\n`;
  response += `  "culture": null,                           // Document-specific: culture code or null\n`;
  response += `  "segment": null,                           // Document-specific: segment or null\n`;
  response += `  "alias": "yourPropertyAlias",             // Document-specific: property alias from document type\n`;
  response += `  "value": <customize from template>        // From template - customize as needed\n`;
  response += `}\n\n`;
  response += `The template provides editorAlias and value structure. You must add culture, segment, and alias based on your document requirements.`;

  return {
    content: [
      {
        type: "text" as const,
        text: response,
      },
    ],
  };
}

export default withStandardDecorators(GetDocumentPropertyValueTemplateTool);
