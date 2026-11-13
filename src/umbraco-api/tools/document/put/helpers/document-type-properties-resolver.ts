import { UmbracoManagementClient } from "@umb-management-client";
import type { GetDocumentTypeByIdResult } from "@/umbraco-api/api/umbracoManagementAPI.js";

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
 * A property's *effective* variance on a given document is the AND of its own definition
 * (which, for a property inherited from a composition, is that composition's own flag) and
 * the root document type's own variance flag. If the document type being edited is itself
 * invariant, every property on it is stored invariant (culture: null / segment: null)
 * regardless of what a composition declares for that property - Umbraco does not let a
 * property vary more than the document type that consumes it.
 *
 * @param documentTypeId - The ID of the document type to resolve properties for
 * @returns Array of resolved properties with their effective variance flags
 */
export async function getAllDocumentTypeProperties(documentTypeId: string): Promise<ResolvedProperty[]> {
  const client = UmbracoManagementClient.getClient();
  const visitedIds = new Set<string>();
  const properties: ResolvedProperty[] = [];

  const rootDocType = await client.getDocumentTypeById(documentTypeId);
  const rootVariesByCulture = rootDocType.variesByCulture;
  const rootVariesBySegment = rootDocType.variesBySegment;

  async function resolveDocumentType(docTypeId: string, preloaded?: GetDocumentTypeByIdResult): Promise<void> {
    // Prevent infinite recursion from circular compositions
    if (visitedIds.has(docTypeId)) {
      return;
    }
    visitedIds.add(docTypeId);

    const docType = preloaded ?? await client.getDocumentTypeById(docTypeId);

    // Add direct properties
    for (const prop of docType.properties) {
      // Skip if we already have this property (earlier compositions take precedence)
      if (!properties.some(p => p.alias === prop.alias)) {
        properties.push({
          alias: prop.alias,
          name: prop.name,
          dataTypeId: prop.dataType.id,
          // AND with the root document type's own flag: a composition's property can't
          // vary more than the document type it's actually used on.
          variesByCulture: prop.variesByCulture && rootVariesByCulture,
          variesBySegment: prop.variesBySegment && rootVariesBySegment
        });
      }
    }

    // Recursively resolve compositions
    for (const composition of docType.compositions) {
      await resolveDocumentType(composition.documentType.id);
    }
  }

  await resolveDocumentType(documentTypeId, rootDocType);
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
