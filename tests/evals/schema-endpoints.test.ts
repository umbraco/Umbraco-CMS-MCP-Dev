import { describe, it } from "@jest/globals";
import { setupConsoleMock, runScenarioTest } from "@umbraco-cms/mcp-server-sdk/evals";

const SCHEMA_TOOLS = [
  "get-data-type-schema",
  "get-data-type-schemas",
  "get-document-type-schema",
  "get-media-type-schema",
  "get-member-type-schema",
  "find-data-type",
  "get-all-document-types",
  "get-media-type-root",
  "get-member-type-root",
  "create-document",
  "delete-document",
];

describe("schema endpoint eval tests", () => {
  setupConsoleMock();

  it("should fetch data type schema for a known data type",
    runScenarioTest({
      prompt: "Find a data type called 'Textstring' using find-data-type, then use get-data-type-schema with its ID to get the JSON Schema. Return the schema.",
      tools: SCHEMA_TOOLS,
      requiredTools: ["find-data-type", "get-data-type-schema"],
      options: { maxTurns: 5 },
    }),
    120000
  );

  it("should fetch data type schemas in batch",
    runScenarioTest({
      prompt: "Find two data types using find-data-type (search for 'Textstring' and 'True/False'), then use get-data-type-schemas with both their IDs to get schemas in a single batch call. Return both schemas.",
      tools: SCHEMA_TOOLS,
      requiredTools: ["find-data-type", "get-data-type-schemas"],
      options: { maxTurns: 8 },
    }),
    120000
  );

  it("should fetch document type schema",
    runScenarioTest({
      prompt: "Get all document types using get-all-document-types, pick the first one, then use get-document-type-schema with its ID to get the JSON Schema. Return the schema.",
      tools: SCHEMA_TOOLS,
      requiredTools: ["get-all-document-types", "get-document-type-schema"],
      options: { maxTurns: 5 },
    }),
    120000
  );

  it("should fetch media type schema",
    runScenarioTest({
      prompt: "Get the root media types using get-media-type-root, pick the first one, then use get-media-type-schema with its ID to get the JSON Schema. Return the schema.",
      tools: SCHEMA_TOOLS,
      requiredTools: ["get-media-type-root", "get-media-type-schema"],
      options: { maxTurns: 5 },
    }),
    120000
  );

  it("should fetch member type schema",
    runScenarioTest({
      prompt: "Get the root member types using get-member-type-root, pick the first one, then use get-member-type-schema with its ID to get the JSON Schema. Return the schema.",
      tools: SCHEMA_TOOLS,
      requiredTools: ["get-member-type-root", "get-member-type-schema"],
      options: { maxTurns: 5 },
    }),
    120000
  );

  it("should fetch document type schema and create document using schema",
    runScenarioTest({
      prompt: `Complete these tasks in order:
1. Get all document types using get-all-document-types
2. Pick a document type and get its schema using get-document-type-schema
3. Use the schema to understand the property structure and create a document of that type using create-document
4. Delete the created document using delete-document
5. When successfully completed, say 'The task has completed successfully'`,
      tools: SCHEMA_TOOLS,
      requiredTools: ["get-document-type-schema", "create-document"],
      successPattern: "task has completed successfully",
      options: { maxTurns: 15 },
    }),
    180000
  );
});
