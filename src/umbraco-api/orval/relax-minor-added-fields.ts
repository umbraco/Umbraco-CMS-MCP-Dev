/**
 * Response fields that later 17.x minors added as `required`.
 *
 * The client is generated against the newest 17.x minor, but the server runs
 * against any 17.x site (the startup check compares the major only). A field
 * added as required in 17.8 is missing from a 17.6 response, so the
 * generated output schema would fail the MCP SDK's output validation on every
 * older site. Generating these fields as optional keeps every tool working
 * across the whole major; on newer sites the field is still returned.
 *
 * When adding an entry, record the minor that introduced it. When the
 * supported floor reaches that minor, the entry can be removed.
 */
export const FIELDS_ADDED_IN_MINORS: Record<string, { fields: string[]; since: string }[]> = {
  DocumentUrlInfoModel: [{ fields: ["isExternal"], since: "17.7" }],
  DocumentCollectionResponseModel: [{ fields: ["hasChildren"], since: "17.8" }],
  MediaCollectionResponseModel: [{ fields: ["hasChildren"], since: "17.8" }],
  DocumentBlueprintTreeItemResponseModel: [{ fields: ["variants"], since: "17.8" }],
};

type Spec = { components?: { schemas?: Record<string, { required?: string[] }> } };

/**
 * Orval input transformer: drops the fields listed in FIELDS_ADDED_IN_MINORS
 * from their schema's `required` list. Throws if a listed schema or field is no
 * longer required in the spec, so stale entries are noticed instead of
 * silently doing nothing.
 */
export function relaxMinorAddedFields<T>(spec: T): T {
  const schemas = (spec as Spec).components?.schemas ?? {};
  for (const [name, entries] of Object.entries(FIELDS_ADDED_IN_MINORS)) {
    const schema = schemas[name];
    for (const field of entries.flatMap((e) => e.fields)) {
      if (!schema?.required?.includes(field)) {
        throw new Error(
          `relaxMinorAddedFields: ${name}.${field} is not a required field in the spec. ` +
            `Remove or update its entry in FIELDS_ADDED_IN_MINORS.`,
        );
      }
      schema.required = schema.required.filter((f) => f !== field);
    }
  }
  return spec;
}
