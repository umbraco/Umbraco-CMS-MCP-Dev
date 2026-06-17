import type { InputTransformerFn } from "orval";

/**
 * Orval input transformer that works around an Umbraco 18 OpenAPI quirk.
 *
 * `ManifestResponseModel.extensions` is declared as `type: array` with no
 * `items`. Orval generates `zod.array()` with no element schema, which fails to
 * compile. Give every such untyped array an empty `items` schema so it
 * generates `zod.array(zod.any())` instead.
 *
 * (Orval 7 also choked on a `$type`/`type` discriminator name collision in
 * polymorphic reference models such as `IReferenceResponseModel`; Orval 8
 * resolves that natively, so that workaround is no longer needed.)
 */
function fixUntypedArrays(schema: unknown): void {
  if (!schema || typeof schema !== "object") return;
  const node = schema as { type?: unknown; items?: unknown };
  if (node.type === "array" && !node.items) {
    node.items = {};
  }
  for (const value of Object.values(schema as Record<string, unknown>)) {
    if (value && typeof value === "object") fixUntypedArrays(value);
  }
}

export const relaxUntypedArrays: InputTransformerFn = (spec) => {
  fixUntypedArrays(spec.components?.schemas);
  return spec;
};

export default relaxUntypedArrays;
