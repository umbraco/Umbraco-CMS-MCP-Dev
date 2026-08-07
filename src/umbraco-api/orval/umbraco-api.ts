// The target-major transformer authenticates against the running Umbraco to
// read its version, using the same UMBRACO_BASE_URL / UMBRACO_CLIENT_ID /
// UMBRACO_CLIENT_SECRET the server runs on. Orval does not load `.env` itself.
import "dotenv/config";
import { defineConfig, type HookFunction } from "orval";
import {
  createUmbracoTargetMajorTransformer,
  orvalImportFixer,
  relaxUntypedArrays,
  postProcessZodFiles,
} from "@umbraco-cms/mcp-server-sdk/orval";

/**
 * Stamps the Umbraco major this server targets into a generated constant.
 *
 * The value is read from the Umbraco instance the client is generated against
 * (`GET /umbraco/management/api/v1/server/information`), so it can never drift
 * from the tool surface. `src/index.ts` feeds the constant to
 * `checkUmbracoVersion`. Requires `UMBRACO_BASE_URL`, `UMBRACO_CLIENT_ID` and
 * `UMBRACO_CLIENT_SECRET` to be set when running `npm run generate`.
 */
const stampTargetMajor = createUmbracoTargetMajorTransformer({
  outputPath: "./src/config/umbraco-target.generated.ts",
});

export const UmbManagementApiOrvalConfig = defineConfig({
  "umbraco-management-api": {
    input: {
      target: "http://localhost:56472/umbraco/swagger/management/swagger.json",
      unsafeDisableValidation: true,
      filters: {
        mode: "exclude",
        tags: ["Temporary File"],
      },
      override: {
        // Transformers compose: relax the schemas, then stamp the target major.
        transformer: (spec) => stampTargetMajor(relaxUntypedArrays(spec)),
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
      target: "http://localhost:56472/umbraco/swagger/management/swagger.json",
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
