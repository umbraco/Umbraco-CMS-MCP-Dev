import { UmbracoManagementClient } from "@umb-management-client";
import { ToolValidationError } from "@umbraco-cms/mcp-server-sdk";
import type {
  DocumentResponseModel,
  DocumentValueModel,
  DocumentVariantRequestModel,
  UpdateDocumentRequestModel
} from "@/umbraco-api/schemas/index.js";
import {
  getAllDocumentTypeProperties,
  validateCultureSegment,
  type ResolvedProperty
} from "./document-type-properties-resolver.js";
import { matchesProperty, getPropertyKey } from "./property-matching.js";
import {
  createEmptyBlockValue,
  getBlockEditorKind,
  getBlockTypeConfigurations,
  getTopLevelBlockContainer,
  normaliseRichTextBlockValue,
  type BlockEditorKind,
  type BlockTypeConfiguration
} from "./block-builder.js";

export interface DocumentBlockContext {
  document: DocumentResponseModel;
  propertyDefinition: ResolvedProperty;
  kind: BlockEditorKind;
  /** The property value object (mutable; part of `document.values`). */
  propertyValue: Record<string, any>;
  container: NonNullable<ReturnType<typeof getTopLevelBlockContainer>>;
  blockConfigs: BlockTypeConfiguration[];
}

/**
 * Loads everything create/delete-document-block need: the document, the property definition
 * (validating culture/segment against its variance), the property's data type (editor kind and
 * block configuration), and the property's top-level block container. A missing or empty
 * property value is initialised to an empty block value for the editor; a present but malformed
 * block structure is rejected rather than overwritten.
 */
export async function loadDocumentBlockContext(model: {
  documentId: string;
  propertyAlias: string;
  culture?: string | null;
  segment?: string | null;
}): Promise<DocumentBlockContext> {
  const client = UmbracoManagementClient.getClient();
  const document = await client.getDocumentById(model.documentId);

  const documentTypeProperties = await getAllDocumentTypeProperties(document.documentType.id);
  const propertyDefinition = documentTypeProperties.find(p => p.alias === model.propertyAlias);
  if (!propertyDefinition) {
    throw new ToolValidationError({
      title: "Property not found",
      detail: `Property '${model.propertyAlias}' does not exist on this document's type`,
      extensions: {
        availableProperties: documentTypeProperties.map(p => p.alias)
      }
    });
  }

  const varianceError = validateCultureSegment(
    { alias: model.propertyAlias, culture: model.culture, segment: model.segment },
    propertyDefinition
  );
  if (varianceError) {
    throw new ToolValidationError({ title: "Invalid culture/segment", detail: varianceError });
  }

  const dataType = await client.getDataTypeById(propertyDefinition.dataTypeId);
  const kind = getBlockEditorKind(dataType.editorAlias);
  if (!kind) {
    throw new ToolValidationError({
      title: "Not a block property",
      detail: `Property '${model.propertyAlias}' uses editor '${dataType.editorAlias}', not a BlockList, BlockGrid, or RichText editor`
    });
  }

  let valueEntry = document.values.find(v =>
    matchesProperty(v, model.propertyAlias, model.culture, model.segment)
  );
  if (!valueEntry) {
    valueEntry = {
      alias: model.propertyAlias,
      culture: model.culture ?? null,
      segment: model.segment ?? null,
      editorAlias: dataType.editorAlias,
      value: null
    } as (typeof document.values)[number];
    document.values.push(valueEntry);
  }

  if (valueEntry.value === null || valueEntry.value === undefined || valueEntry.value === "") {
    valueEntry.value = createEmptyBlockValue(kind);
  } else if (kind === "RichText" && typeof valueEntry.value === "object") {
    // Initialises missing fields; throws on present-but-malformed ones rather than overwriting them.
    normaliseRichTextBlockValue(valueEntry.value as Record<string, any>);
  }

  const propertyValue = valueEntry.value as Record<string, any>;
  const container = getTopLevelBlockContainer(propertyValue, kind);
  if (!container) {
    throw new ToolValidationError({
      title: "No block structure found",
      detail: `Property '${getPropertyKey(model.propertyAlias, model.culture, model.segment)}' does not contain a ${kind} block structure`,
      extensions: { propertyValue }
    });
  }

  return {
    document,
    propertyDefinition,
    kind,
    propertyValue,
    container,
    blockConfigs: getBlockTypeConfigurations(dataType.values)
  };
}

/**
 * Writes the (mutated) document back in one PUT, the same way update-block-property does.
 */
export async function saveDocumentValues(documentId: string, document: DocumentResponseModel): Promise<void> {
  const client = UmbracoManagementClient.getClient();

  const values: DocumentValueModel[] = document.values.map(v => ({
    alias: v.alias,
    culture: v.culture,
    segment: v.segment,
    value: v.value
  }));

  const variants: DocumentVariantRequestModel[] = document.variants.map(v => ({
    culture: v.culture,
    segment: v.segment,
    name: v.name
  }));

  const payload: UpdateDocumentRequestModel = {
    values,
    variants,
    template: document.template
  };

  await client.putDocumentById(documentId, payload);
}
