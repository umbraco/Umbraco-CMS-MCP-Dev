import { UmbracoManagementClient } from "@umb-management-client";
import type { DataTypeResponseModel } from "@/umbraco-api/schemas/index.js";
import {
  propertyValueTemplates,
  type PropertyValueTemplate,
} from "../../document/post/property-value-templates.js";

const VALUE_TYPE_BY_EDITOR_ALIAS: Record<string, string> = {
  "Umbraco.TextBox": "STRING",
  "Umbraco.TextArea": "STRING",
  "Umbraco.MarkdownEditor": "STRING",
  "Umbraco.CodeEditor": "STRING",
  "Umbraco.EmailAddress": "STRING",
  "Umbraco.Integer": "INTEGER",
  "Umbraco.Decimal": "DECIMAL",
  "Umbraco.DateTime": "DATETIME",
  "Umbraco.TrueFalse": "INTEGER",
  "Umbraco.Label": "STRING",
};

function findTemplateByEditorAlias(editorAlias: string): PropertyValueTemplate | undefined {
  const key = Object.keys(propertyValueTemplates).find(
    (k) => propertyValueTemplates[k].editorAlias.toLowerCase() === editorAlias.toLowerCase()
  );
  return key ? propertyValueTemplates[key] : undefined;
}

export async function synthesizeDataTypeSchema(
  id: string
): Promise<{ valueTypeName: string | null; jsonSchema: unknown }> {
  const client = UmbracoManagementClient.getClient();
  const dataType = (await client.getDataTypeById(id)) as unknown as DataTypeResponseModel;

  const template = findTemplateByEditorAlias(dataType.editorAlias);
  const valueTypeName =
    VALUE_TYPE_BY_EDITOR_ALIAS[dataType.editorAlias] ??
    (template?.value !== undefined ? "JSON" : null);

  const jsonSchema = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title: dataType.name,
    description:
      "Synthesized from hardcoded property-value templates (Umbraco < 17.4 fallback).",
    dataTypeId: dataType.id,
    editorAlias: dataType.editorAlias,
    editorUiAlias: dataType.editorUiAlias,
    example: template?.value,
    notes: template?._notes,
  };

  return { valueTypeName, jsonSchema };
}
