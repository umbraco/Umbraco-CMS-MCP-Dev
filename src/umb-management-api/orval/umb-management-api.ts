import { defineConfig, type HookFunction } from "orval";
import { orvalImportFixer } from "@umbraco-cms/mcp-server-sdk";
import fs from "node:fs";
import path from "node:path";
import { relaxUntypedArrays } from "./relax-untyped-arrays.js";

function collectZodFiles(paths: string[]): string[] {
  const files: string[] = [];
  for (const p of paths) {
    if (!fs.existsSync(p)) continue;
    if (fs.lstatSync(p).isDirectory()) {
      for (const f of fs.readdirSync(p)) {
        if (f.endsWith(".zod.ts")) files.push(path.join(p, f));
      }
    } else if (p.endsWith(".zod.ts")) {
      files.push(p);
    }
  }
  return files;
}

/**
 * Replaces zod.uuid() with zod.guid() in generated .zod.ts files.
 *
 * Umbraco uses GUIDs that are not RFC 4122 compliant UUIDs (e.g. sequential
 * version IDs like 0000003f-0000-0000-0000-000000000000). Zod's uuid()
 * enforces RFC 4122 version/variant bits and rejects these. Zod's guid()
 * validates the 8-4-4-4-12 hex shape without RFC 4122 constraints.
 */
function relaxUuidToGuid(paths: string[]): void {
  for (const file of collectZodFiles(paths)) {
    const content = fs.readFileSync(file, "utf8");
    if (content.includes("zod.uuid()")) {
      fs.writeFileSync(file, content.replaceAll("zod.uuid()", "zod.guid()"), "utf8");
    }
  }
}

/**
 * Lower-cases the first letter of every generated zod schema export.
 *
 * Umbraco's OpenAPI operationIds are PascalCase. Orval 7 camel-cased the zod
 * schema export names derived from them (GetCulture -> getCultureResponse);
 * Orval 8 keeps the PascalCase (GetCultureResponse). Every hand-written tool
 * imports these schemas by their camelCase name, so restoring the casing here
 * keeps the generated zod surface stable across the orval upgrade. Only names
 * declared as `export const` are rewritten, so imported types (zod) and object
 * keys are left untouched.
 */
function camelCaseZodExports(paths: string[]): void {
  for (const file of collectZodFiles(paths)) {
    const content = fs.readFileSync(file, "utf8");

    const names = new Set<string>();
    for (const match of content.matchAll(/export const ([A-Z][A-Za-z0-9_]*)/g)) {
      names.add(match[1]);
    }
    if (names.size === 0) continue;

    const updated = content.replace(/\b[A-Z][A-Za-z0-9_]*\b/g, (id) =>
      names.has(id) ? id.charAt(0).toLowerCase() + id.slice(1) : id
    );
    fs.writeFileSync(file, updated, "utf8");
  }
}

/**
 * Restores orval 7's handling of query params that have a falsy spec default.
 *
 * Umbraco declares query params like `foldersOnly`/`includeAncestors`
 * (`default: false`), `skip` (`default: 0`) and `filter` (`default: ""`).
 * Orval 7 emitted these as `.optional()` (it ignored falsy defaults); orval 8
 * emits `.default(<const>)`, which makes the schema's inferred output type a
 * required field and breaks tools/tests that pass the param as `undefined`.
 * Re-emit them as `.optional()` to keep the v7 surface. Truthy defaults (e.g.
 * `take`'s `100`) are left as `.default(...)`, matching both versions. The
 * generated default constants are kept (orval 7 kept them too).
 */
function restoreV7OptionalDefaults(paths: string[]): void {
  for (const file of collectZodFiles(paths)) {
    let content = fs.readFileSync(file, "utf8");

    const falsy = new Set<string>();
    for (const match of content.matchAll(/export const (\w+) = (.+?);/g)) {
      const value = match[2].trim();
      if (["0", "false", "''", '""', "``", "null"].includes(value)) {
        falsy.add(match[1]);
      }
    }
    if (falsy.size === 0) continue;

    for (const name of falsy) {
      content = content.replaceAll(`.default(${name})`, ".optional()");
    }
    fs.writeFileSync(file, content, "utf8");
  }
}

function postProcessZodFiles(paths: string[]): void {
  relaxUuidToGuid(paths);
  camelCaseZodExports(paths);
  restoreV7OptionalDefaults(paths);
}

export const UmbManagementApiOrvalConfig = defineConfig({
  "umbraco-management-api": {
    input: {
      target: "http://localhost:56472/umbraco/openapi/management.json",
      unsafeDisableValidation: true,
      filters: {
        mode: "exclude",
        tags: ["Temporary File"],
      },
      override: {
        transformer: relaxUntypedArrays,
      },
    },
    output: {
      mode: "split",
      clean: true,
      target: "./src/umb-management-api/api/api",
      schemas: "./src/umb-management-api/api/schemas",
      client: "axios",
      override: {
        mutator: {
          path: "./src/umb-management-api/api/client.ts",
          name: "UmbracoManagementClient",
        },
      },
    },
    hooks: {
      afterAllFilesWrite: orvalImportFixer as HookFunction,
    },
  },
  "umbraco-management-api-zod": {
    input: {
      target: "http://localhost:56472/umbraco/openapi/management.json",
      unsafeDisableValidation: true,
      filters: {
        mode: "exclude",
        tags: ["Temporary File"],
      },
      override: {
        transformer: relaxUntypedArrays,
      },
    },
    output: {
      mode: "split",
      client: "zod",
      target: "./src/umb-management-api/api/",
      fileExtension: ".zod.ts",
      override: {
        zod: {
          dateTimeOptions: {
            local: true,
            offset: true,
          },
          coerce: {
            query: ["number", "boolean"],
          },
          generate: {
            param: true,
            query: true,
            header: true,
            body: true,
            response: true,
          },
        },
      },
    },
    hooks: {
      afterAllFilesWrite: postProcessZodFiles as HookFunction,
    },
  },
});
