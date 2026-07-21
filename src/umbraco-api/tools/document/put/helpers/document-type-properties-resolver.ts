import { UmbracoManagementClient } from "@umb-management-client";

/**
 * Represents a resolved property from a document type, including properties from compositions
 */
export interface ResolvedProperty {
  alias: string;
  name: string;
  dataTypeId: string;
  variesByCulture: boolean;
  variesBySegment: boolean;
}

/**
 * Recursively resolves all properties from a document type, including properties from compositions.
 *
 * @param documentTypeId - The ID of the document type to resolve properties for
 * @returns Array of resolved properties with their variance flags
 */
export async function getAllDocumentTypeProperties(documentTypeId: string): Promise<ResolvedProperty[]> {
  const client = UmbracoManagementClient.getClient();
  const visitedIds = new Set<string>();
  const properties: ResolvedProperty[] = [];

  async function resolveDocumentType(docTypeId: string): Promise<void> {
    // Prevent infinite recursion from circular compositions
    if (visitedIds.has(docTypeId)) {
      return;
    }
    visitedIds.add(docTypeId);

    const docType = await client.getDocumentTypeById(docTypeId);

    // Add direct properties
    for (const prop of docType.properties) {
      // Skip if we already have this property (earlier compositions take precedence)
      if (!properties.some(p => p.alias === prop.alias)) {
        properties.push({
          alias: prop.alias,
          name: prop.name,
          dataTypeId: prop.dataType.id,
          variesByCulture: prop.variesByCulture,
          variesBySegment: prop.variesBySegment
        });
      }
    }

    // Recursively resolve compositions
    for (const composition of docType.compositions) {
      await resolveDocumentType(composition.documentType.id);
    }
  }

  await resolveDocumentType(documentTypeId);
  return properties;
}

/**
 * Validates that the provided culture/segment matches the property's variance requirements.
 *
 * @param prop - The property being set with optional culture/segment
 * @param def - The property definition with variance flags
 * @returns null if valid, or an error message string if invalid
 */
export function validateCultureSegment(
  prop: { alias: string; culture?: string | null; segment?: string | null },
  def: { variesByCulture: boolean; variesBySegment: boolean }
): string | null {
  // Culture validation
  if (!def.variesByCulture && prop.culture) {
    return `Property '${prop.alias}' does not vary by culture, but culture '${prop.culture}' was provided`;
  }
  if (def.variesByCulture && !prop.culture) {
    return `Property '${prop.alias}' varies by culture - culture is required`;
  }

  // Segment validation
  if (!def.variesBySegment && prop.segment) {
    return `Property '${prop.alias}' does not vary by segment, but segment '${prop.segment}' was provided`;
  }
  if (def.variesBySegment && !prop.segment) {
    return `Property '${prop.alias}' varies by segment - segment is required`;
  }

  return null;
}
