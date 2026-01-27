import { defineConfig } from "orval";
import { orvalImportFixer } from "@umbraco-cms/mcp-server-sdk";

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
          path: "@umbraco-cms/mcp-server-sdk",
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
  },
});
