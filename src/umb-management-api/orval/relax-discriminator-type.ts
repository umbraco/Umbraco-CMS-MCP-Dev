import type {
  OpenAPIObject,
  SchemaObject,
  ReferenceObject,
} from "openapi3-ts/oas30";

/**
 * Orval input transformer that works around two Umbraco 18 OpenAPI quirks.
 *
 * Umbraco 18 switched OpenAPI document generation to
 * Microsoft.AspNetCore.OpenApi (from Swashbuckle) and emits an OpenAPI 3.1
 * document. Two things trip up Orval 7.x:
 *
 * 1. **`$type`/`type` name collision in polymorphic reference models.**
 *    Models such as `IReferenceResponseModel` are a discriminated `anyOf`
 *    keyed on a `$type` property. Orval resolves discriminators by synthesising
 *    a `$type` member onto every variant, and sanitises names by stripping the
 *    leading `$` — so `$type` becomes `Type`. The `DefaultReferenceResponseModel`
 *    variant also has a free-text `type` data property, which sanitises to the
 *    same `Type`. In split mode Orval emits two property-type aliases with the
 *    identical name and aborts with "Duplicate schema names detected".
 *
 *    Fix: only for a discriminated parent whose variant carries a real `type`
 *    data property, drop the `discriminator` (so Orval stops synthesising
 *    `$type`, leaving a plain `anyOf` union) and strip the redundant `$type`
 *    tag from that variant. Every other polymorphic model — including request
 *    models like `IPermissionPresentationModel` whose builders set `$type` to
 *    pick a variant — is untouched.
 *
 * 2. **Untyped arrays.** `ManifestResponseModel.extensions` is declared as
 *    `type: array` with no `items`. Orval generates `zod.array()` with no
 *    element schema, which fails to compile. We give such arrays an empty
 *    `items` schema so they generate `zod.array(zod.any())`.
 */

function refName(sub: SchemaObject | ReferenceObject): string | undefined {
  const ref = (sub as ReferenceObject).$ref;
  return ref ? ref.split("/").pop() : undefined;
}

function hasTypeProperty(schema: SchemaObject | undefined): boolean {
  return !!schema?.properties && "type" in schema.properties;
}

function fixUntypedArrays(schema: unknown): void {
  if (!schema || typeof schema !== "object") return;
  const s = schema as SchemaObject;
  if (s.type === "array" && !s.items) {
    s.items = {};
  }
  for (const value of Object.values(schema as Record<string, unknown>)) {
    if (value && typeof value === "object") fixUntypedArrays(value);
  }
}

export function relaxDiscriminatorType(spec: OpenAPIObject): OpenAPIObject {
  const schemas = spec.components?.schemas;
  if (!schemas) return spec;

  // Quirk 1 — resolve the $type/type discriminator collision.
  for (const parent of Object.values(schemas) as SchemaObject[]) {
    const disc = parent.discriminator;
    if (!disc || disc.propertyName !== "$type") continue;

    const variantNames = new Set<string>();
    for (const key of ["anyOf", "oneOf", "allOf"] as const) {
      for (const sub of (parent[key] ?? []) as (SchemaObject | ReferenceObject)[]) {
        const name = refName(sub);
        if (name) variantNames.add(name);
      }
    }
    for (const mapped of Object.values(disc.mapping ?? {})) {
      variantNames.add(mapped.split("/").pop()!);
    }

    const clashing = [...variantNames].filter((n) =>
      hasTypeProperty(schemas[n] as SchemaObject)
    );
    if (clashing.length === 0) continue;

    delete parent.discriminator;

    for (const name of clashing) {
      const variant = schemas[name] as SchemaObject;
      if (variant.properties && "$type" in variant.properties) {
        delete variant.properties["$type"];
      }
      if (Array.isArray(variant.required)) {
        variant.required = variant.required.filter((r) => r !== "$type");
        if (variant.required.length === 0) delete variant.required;
      }
    }
  }

  // Quirk 2 — give untyped arrays an items schema.
  fixUntypedArrays(schemas);

  return spec;
}

export default relaxDiscriminatorType;
