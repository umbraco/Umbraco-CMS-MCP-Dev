import { describe, it } from "@jest/globals";
import { setupConsoleMock, runScenarioTest } from "@umbraco-cms/mcp-server-sdk/evals";

const TOOLS = [
  "find-data-type",
  "create-data-type",
  "delete-data-type",
  "get-data-type-schema",
  "get-data-type-schemas",
  "create-document-type",
  "delete-document-type",
  "get-document-type-schema",
  "get-all-document-types",
  "create-document",
  "delete-document",
  "get-icons",
];

describe("schema-driven content creation eval tests", () => {
  setupConsoleMock();

  it("should create a data type and verify its JSON Schema matches the configured fields",
    runScenarioTest({
      prompt: `Complete these tasks in order:
1. Create a data type called '_TestStructuredAddress' with editorAlias 'Umbraco.StructuredAddress' and editorUiAlias 'Umb.PropertyEditorUi.StructuredAddress'. Set values to enable and require all fields: [{ alias: "showStreet", value: true }, { alias: "requireStreet", value: true }, { alias: "showCity", value: true }, { alias: "requireCity", value: true }, { alias: "showPostcode", value: true }, { alias: "requirePostcode", value: true }, { alias: "showCountry", value: true }, { alias: "requireCountry", value: true }]
2. Get the JSON Schema for this data type using get-data-type-schema with the ID returned from step 1
3. Verify the schema describes an object with properties for street, city, postcode, and country
4. Delete the data type
5. When successfully completed, say 'The task has completed successfully'`,
      tools: TOOLS,
      requiredTools: ["create-data-type", "get-data-type-schema", "delete-data-type"],
      successPattern: "task has completed successfully",
      options: { maxTurns: 10 },
    }),
    120000
  );

  it("should use document type schema to create a document with correctly shaped property values",
    runScenarioTest({
      prompt: `Complete these tasks in order. IMPORTANT: If any step fails because an item already exists, delete the existing item first and retry.
1. Create a data type called '_TestStructuredAddress_ForDoc' with editorAlias 'Umbraco.StructuredAddress' and editorUiAlias 'Umb.PropertyEditorUi.StructuredAddress'. Set values: [{ alias: "showStreet", value: true }, { alias: "requireStreet", value: true }, { alias: "showCity", value: true }, { alias: "requireCity", value: true }, { alias: "showPostcode", value: true }, { alias: "requirePostcode", value: true }, { alias: "showCountry", value: true }, { alias: "requireCountry", value: true }]. Note the returned data type ID.
2. Get available icons using get-icons and pick any icon alias.
3. Create a document type called '_TestAddressPage_ForDoc' with alias 'testAddressPageForDoc', using the icon from step 2, with allowedAsRoot true. Add one property: name 'Address', alias 'address', dataTypeId set to the data type ID from step 1, tab 'Content'. Note the document type ID.
4. Get the document type schema using get-document-type-schema with the document type ID from step 3. This schema tells you exactly what shape the address property value needs to be.
5. Using the schema from step 4, create a document of type '_TestAddressPage_ForDoc'. Set the name to '_TestAddressDocument' and populate the address property with realistic data matching the schema (e.g. street: '123 Main Street', city: 'London', postcode: 'SW1A 1AA', country: 'United Kingdom').
6. Delete the document using delete-document.
7. Delete the document type using delete-document-type.
8. Delete the data type using delete-data-type.
9. When successfully completed, say 'The task has completed successfully'`,
      tools: TOOLS,
      requiredTools: ["create-data-type", "create-document-type", "get-document-type-schema", "create-document", "delete-document", "delete-document-type", "delete-data-type", "get-icons"],
      successPattern: "task has completed successfully",
      options: { maxTurns: 20 },
    }),
    180000
  );

  it("should produce different schemas for different data type configurations and create valid documents for each",
    runScenarioTest({
      prompt: `Complete these tasks in order:
1. Create a data type called '_TestAddress_AllFields' with editorAlias 'Umbraco.StructuredAddress' and editorUiAlias 'Umb.PropertyEditorUi.StructuredAddress'. Set values: [{ alias: "showStreet", value: true }, { alias: "requireStreet", value: true }, { alias: "showCity", value: true }, { alias: "requireCity", value: true }, { alias: "showPostcode", value: true }, { alias: "requirePostcode", value: true }, { alias: "showCountry", value: true }, { alias: "requireCountry", value: true }]. Note the ID.
2. Create a data type called '_TestAddress_Minimal' with editorAlias 'Umbraco.StructuredAddress' and editorUiAlias 'Umb.PropertyEditorUi.StructuredAddress'. Set values: [{ alias: "showStreet", value: true }, { alias: "requireStreet", value: true }, { alias: "showCity", value: true }, { alias: "requireCity", value: false }, { alias: "showPostcode", value: false }, { alias: "requirePostcode", value: false }, { alias: "showCountry", value: false }, { alias: "requireCountry", value: false }]. Note the ID.
3. Use get-data-type-schemas with both IDs to fetch their schemas in a single batch call. Confirm the schemas differ: AllFields should have 4 properties (street, city, postcode, country), Minimal should have only 2 (street, city).
4. Get available icons using get-icons and pick any icon alias.
5. Create a document type called '_TestAllFieldsPage' with alias 'testAllFieldsPage', icon from step 4, allowedAsRoot true, with one property: name 'Address', alias 'address', dataTypeId from the AllFields data type, tab 'Content'. Note the ID.
6. Create a document type called '_TestMinimalPage' with alias 'testMinimalPage', icon from step 4, allowedAsRoot true, with one property: name 'Address', alias 'address', dataTypeId from the Minimal data type, tab 'Content'. Note the ID.
7. Get the document type schema for '_TestAllFieldsPage' using get-document-type-schema. Use it to create a document called '_TestAllFieldsDoc' with a full address (street, city, postcode, country).
8. Get the document type schema for '_TestMinimalPage' using get-document-type-schema. Use it to create a document called '_TestMinimalDoc' with only the fields the schema requires (street and city only, no postcode or country).
9. Delete both documents, both document types, and both data types.
10. When successfully completed, say 'The task has completed successfully'`,
      tools: TOOLS,
      requiredTools: ["create-data-type", "get-data-type-schemas", "create-document-type", "get-document-type-schema", "create-document", "delete-document", "delete-document-type", "delete-data-type", "get-icons"],
      successPattern: "task has completed successfully",
      options: { maxTurns: 30 },
    }),
    300000
  );
});
