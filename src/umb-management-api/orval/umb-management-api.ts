import { defineConfig } from "orval";
import { orvalImportFixer } from "@umbraco-cms/mcp-server-sdk";
import fs from "node:fs";
import path from "node:path";

/**
 * Replaces zod.uuid() with zod.guid() in generated .zod.ts files.
 *
 * Umbraco uses GUIDs that are not RFC 4122 compliant UUIDs (e.g. sequential
 * version IDs like 0000003f-0000-0000-0000-000000000000). Zod's uuid()
 * enforces RFC 4122 version/variant bits and rejects these. Zod's guid()
 * validates the 8-4-4-4-12 hex shape without RFC 4122 constraints.
 */
function relaxUuidToGuid(paths: string[]): void {
  for (const p of paths) {
    if (!fs.existsSync(p)) continue;

    const stat = fs.lstatSync(p);
    const files = stat.isDirectory()
      ? fs.readdirSync(p)
          .filter((f) => f.endsWith(".zod.ts"))
          .map((f) => path.join(p, f))
      : p.endsWith(".zod.ts")
        ? [p]
        : [];

    for (const file of files) {
      const content = fs.readFileSync(file, "utf8");
      if (content.includes("zod.uuid()")) {
        fs.writeFileSync(file, content.replaceAll("zod.uuid()", "zod.guid()"), "utf8");
      }
    }
  }
}

export const UmbManagementApiOrvalConfig = defineConfig({
  "umbraco-management-api": {
    input: {
      target: "http://localhost:56472/umbraco/swagger/management/swagger.json",
      validation: false,
      filters: {
        mode: "exclude",
        tags: ["Temporary File"],
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
      afterAllFilesWrite: orvalImportFixer,
    },
  },
  "umbraco-management-api-zod": {
    input: {
      target: "http://localhost:56472/umbraco/swagger/management/swagger.json",
      validation: false,
      filters: {
        mode: "exclude",
        tags: ["Temporary File"],
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
      afterAllFilesWrite: relaxUuidToGuid,
    },
  },
});
