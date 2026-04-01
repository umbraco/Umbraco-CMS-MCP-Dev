import { z } from "zod";
import {
  normalizeObjectSchema,
  safeParseAsync,
  getParseErrorMessage,
} from "@modelcontextprotocol/sdk/server/zod-compat.js";
import { availableCollections } from "../collection-registry.js";
import { sections } from "auth/umbraco-auth-policies.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/currentUserResponseModel.js";

/**
 * Validates that every tool's outputSchema accepts Umbraco-realistic data
 * through the MCP SDK's actual validation pipeline.
 *
 * This catches overly-strict format validators (uuid, datetime, etc.) that
 * reject valid Umbraco responses. It uses the SDK's own normalizeObjectSchema
 * + safeParseAsync — the exact code path used at runtime.
 *
 * When a new SDK version introduces a stricter validator for any format,
 * this test will fail with a clear message showing which tool and field broke.
 */

// Non-RFC 4122 GUID that Umbraco uses for sequential IDs (e.g. document versions).
// Version byte is 0 and variant byte is 0 — both violate RFC 4122.
const UMBRACO_NON_RFC4122_GUID = "0000003f-0000-0000-0000-000000000000";

/**
 * Returns a sample value for a known string format, or undefined if unrecognised.
 * Add entries here when Umbraco returns values in a format that might trip up
 * a strict Zod validator.
 */
function sampleForFormat(format: string): string | undefined {
  switch (format) {
    case "uuid":
    case "guid":
      return UMBRACO_NON_RFC4122_GUID;
    case "datetime":
      return "2024-01-15T10:30:00";
    case "date":
      return "2024-01-15";
    case "time":
      return "10:30:00";
    case "email":
      return "test@example.com";
    case "url":
    case "uri":
      return "https://example.com";
    default:
      return undefined;
  }
}

/**
 * Generates a sample value for a Zod schema using Umbraco-realistic values
 * that stress-test format validators. GUIDs use non-RFC 4122 values,
 * dates use local-time format, etc.
 */
function generateSample(schema: z.ZodType): unknown {
  const def = (schema as any).def ?? (schema as any)._def;
  if (!def) return undefined;

  const type: string = def.type ?? def.typeName;
  const format: string | undefined = def.format;

  // Check top-level format first (Zod 4 string subtypes like ZodGUID, ZodUUID
  // have def.type="string" and def.format="guid"/"uuid")
  if (format) {
    const sample = sampleForFormat(format);
    if (sample !== undefined) return sample;
  }

  switch (type) {
    case "string": {
      // Check for format constraints in checks array (e.g. zod.string().datetime())
      const checks: any[] = def.checks ?? [];
      for (const check of checks) {
        const checkFormat = check?.format ?? check?.def?.format;
        if (checkFormat) {
          const sample = sampleForFormat(checkFormat);
          if (sample !== undefined) return sample;
        }
      }
      // Plain string — check for minLength
      const minLen = checks.find((c: any) => c?.minLength != null)?.minLength ?? 0;
      return minLen > 0 ? "a".repeat(minLen) : "test-string";
    }

    case "number":
    case "integer":
      return 1;

    case "boolean":
      return true;

    case "object": {
      const shape = def.shape ?? {};
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(shape)) {
        result[key] = generateSample(value as z.ZodType);
      }
      return result;
    }

    case "array": {
      const element = def.element ?? def.items;
      return element ? [generateSample(element)] : [];
    }

    case "optional": {
      const inner = def.innerType;
      return inner ? generateSample(inner) : undefined;
    }

    case "nullable": {
      const inner = def.innerType;
      return inner ? generateSample(inner) : null;
    }

    case "union": {
      const options = def.options ?? [];
      return options.length > 0 ? generateSample(options[0]) : undefined;
    }

    case "enum": {
      // Zod 4 uses def.entries (object), Zod 3 uses def.values (array)
      const entries = def.entries;
      if (entries && typeof entries === "object") {
        const first = Object.values(entries)[0];
        if (first !== undefined) return first;
      }
      const values = def.values;
      if (Array.isArray(values) && values.length > 0) return values[0];
      return "unknown";
    }

    case "literal":
      return def.values?.[0] ?? def.value;

    case "record": {
      // zod.record(keyType, valueType) — generate a sample record
      const valueType = def.valueType;
      return valueType ? { "sample-key": generateSample(valueType) } : {};
    }

    case "intersection": {
      // Merge samples from both sides
      const left = def.left ? generateSample(def.left) : {};
      const right = def.right ? generateSample(def.right) : {};
      return { ...(left as any), ...(right as any) };
    }

    case "tuple": {
      // Generate a sample for each item in the tuple
      const items: any[] = def.items ?? [];
      return items.map((item: z.ZodType) => generateSample(item));
    }

    case "custom":
      // z.instanceof(File) etc — skip, can't generate meaningful sample
      return undefined;

    case "unknown":
    case "any":
      return "test-value";

    case "never":
    case "void":
    case "undefined":
      return undefined;

    default:
      return undefined;
  }
}

// Admin user mock with access to all tools
const adminUser: CurrentUserResponseModel = {
  allowedSections: Object.values(sections),
  fallbackPermissions: [
    "Umb.Document.Read", "Umb.Document.Create", "Umb.Document.Update",
    "Umb.Document.Delete", "Umb.Document.Publish", "Umb.Document.Unpublish",
    "Umb.Document.Rollback", "Umb.Document.Move", "Umb.Document.Copy",
    "Umb.Document.Sort", "Umb.Document.CultureAndHostnames",
    "Umb.Document.PublicAccess", "Umb.Document.Permissions",
    "Umb.Document.Notifications", "Umb.Document.CreateBlueprint",
    "Umb.Document.RecycleBin",
  ],
  userGroupIds: [{ id: "7E76AB0F-15B8-40E0-8E8B-B1E20E998F42" }],
  isAdmin: true,
  id: "test-admin",
  email: "admin@test.com",
  userName: "admin",
  name: "Test Admin",
  languageIsoCode: "en-US",
  documentStartNodeIds: [],
  mediaStartNodeIds: [],
  avatarUrls: [],
  languages: [],
  hasAccessToAllLanguages: true,
  hasAccessToSensitiveData: true,
} as unknown as CurrentUserResponseModel;

// Gather all tools with outputSchemas
const allTools = availableCollections.flatMap((collection) => {
  try {
    return collection.tools(adminUser);
  } catch {
    return [];
  }
});

const toolsWithOutputSchema = allTools
  .filter((tool) => tool.outputSchema !== undefined)
  .map((tool) => [tool.name, tool] as const);

describe("outputSchema Umbraco compatibility", () => {
  it("should have tools to validate", () => {
    expect(toolsWithOutputSchema.length).toBeGreaterThan(0);
  });

  it.each(toolsWithOutputSchema)(
    "%s: outputSchema must accept Umbraco-realistic data via SDK validation",
    async (_name, tool) => {
      // Reconstruct schema exactly as the MCP SDK does
      const obj = normalizeObjectSchema(tool.outputSchema);
      if (!obj) return;

      // Generate sample with Umbraco-realistic values
      const sample = generateSample(obj as unknown as z.ZodType);

      // Validate using the SDK's own safeParseAsync
      const result = await safeParseAsync(obj, sample);

      if (!result.success) {
        const error = "error" in result ? result.error : "Unknown error";
        const message = getParseErrorMessage(error);
        throw new Error(
          `MCP SDK output validation would reject Umbraco-realistic data:\n` +
          `  Tool: ${_name}\n` +
          `  Error: ${message}\n` +
          `  Sample: ${JSON.stringify(sample, null, 2)}\n` +
          `\nThis likely means a Zod format validator is too strict for ` +
          `values Umbraco actually returns. Check the outputSchema for ` +
          `overly-strict format constraints (uuid, datetime, etc.).`
        );
      }
    }
  );
});
