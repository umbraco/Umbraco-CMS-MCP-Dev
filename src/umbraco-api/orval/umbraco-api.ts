import { defineConfig, type HookFunction } from "orval";
import {
  orvalImportFixer,
  relaxUntypedArrays,
  postProcessZodFiles,
} from "@umbraco-cms/mcp-server-sdk";

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
      target: "./src/umbraco-api/api/api",
      schemas: "./src/umbraco-api/api/schemas",
      client: "axios",
      override: {
        mutator: {
          path: "./src/umbraco-api/api/client.ts",
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
      target: "./src/umbraco-api/api/",
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
