import { UmbracoManagementClient } from "@umb-management-client";
import type {
  DocumentTypeResponseModel,
  DataTypeResponseModel,
} from "@/umbraco-api/schemas/index.js";
import {
  propertyValueTemplates,
  type PropertyValueTemplate,
} from "../post/property-value-templates.js";

function findTemplateByEditorAlias(editorAlias: string): PropertyValueTemplate | undefined {
  const key = Object.keys(propertyValueTemplates).find(
    (k) => propertyValueTemplates[k].editorAlias.toLowerCase() === editorAlias.toLowerCase()
  );
  return key ? propertyValueTemplates[key] : undefined;
}

function buildPropertyEntry(
  prop: { alias: string; name: string; description?: string | null },
  dataType: DataTypeResponseModel,
  template: PropertyValueTemplate | undefined
) {
  return {
    title: prop.name,
    description: prop.description ?? undefined,
    editorAlias: dataType.editorAlias,
    dataTypeId: dataType.id,
    dataTypeName: dataType.name,
    example: template?.value,
    notes: template?._notes,
  };
}

export async function synthesizeDocumentTypeSchema(id: string): Promise<{ schema: unknown }> {
  const client = UmbracoManagementClient.getClient();

  const docType = (await client.getDocumentTypeById(id)) as unknown as DocumentTypeResponseModel;

  const propertyEntries: Record<string, unknown> = {};
  for (const prop of docType.properties) {
    const dataType = (await client.getDataTypeById(
      prop.dataType.id
    )) as unknown as DataTypeResponseModel;
    const template = findTemplateByEditorAlias(dataType.editorAlias);
    propertyEntries[prop.alias] = buildPropertyEntry(prop, dataType, template);
  }

  const schema = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title: docType.name,
    description:
      docType.description ??
      "Synthesized from hardcoded property-value templates (Umbraco < 17.4 fallback).",
    type: "object",
    documentTypeId: docType.id,
    documentTypeAlias: docType.alias,
    properties: propertyEntries,
  };

  return { schema };
}
