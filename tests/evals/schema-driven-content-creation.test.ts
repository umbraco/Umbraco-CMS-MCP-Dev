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

// These scenarios exercise the IValueSchemaProvider mechanism Umbraco shipped
// in 17.4 (Umbraco.Slider is the simplest real editor with a configuration-
// dependent JSON Schema — its `from`/`to` value-shape carries a `maximum`
// constraint that mirrors the configured `maxVal`).
describe("schema-driven content creation eval tests", () => {
  setupConsoleMock();

  it("should create a data type and verify its JSON Schema matches the configured fields",
    runScenarioTest({
      prompt: `Complete these tasks in order:
1. Create a data type called '_TestSliderSchema' with editorAlias 'Umbraco.Slider' and editorUiAlias 'Umb.PropertyEditorUi.Slider'. Set values to define a 0-50 range: [{ alias: "minVal", value: 0 }, { alias: "maxVal", value: 50 }, { alias: "initVal1", value: 0 }, { alias: "initVal2", value: 0 }, { alias: "step", value: 1 }]
2. Get the JSON Schema for this data type using get-data-type-schema with the ID returned from step 1
3. Verify the schema describes an object with numeric 'from' and 'to' properties, and that both properties carry a 'maximum' constraint of 50 reflecting the configured maxVal
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
1. Create a data type called '_TestSliderSchema_ForDoc' with editorAlias 'Umbraco.Slider' and editorUiAlias 'Umb.PropertyEditorUi.Slider'. Set values: [{ alias: "minVal", value: 0 }, { alias: "maxVal", value: 100 }, { alias: "initVal1", value: 0 }, { alias: "initVal2", value: 0 }, { alias: "step", value: 1 }]. Note the returned data type ID.
2. Get available icons using get-icons and pick any icon alias.
3. Create a document type called '_TestSliderPage_ForDoc' with alias 'testSliderPageForDoc', using the icon from step 2, with allowedAsRoot true. Add one property: name 'Range', alias 'range', dataTypeId set to the data type ID from step 1, tab 'Content'. Note the document type ID.
4. Get the document type schema using get-document-type-schema with the document type ID from step 3. This schema tells you exactly what shape the range property value needs to be.
5. Using the schema from step 4, create a document of type '_TestSliderPage_ForDoc'. Set the name to '_TestSliderDocument' and populate the range property with a value matching the schema (an object with numeric from and to, both within 0-100).
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
1. Create a data type called '_TestSlider_Wide' with editorAlias 'Umbraco.Slider' and editorUiAlias 'Umb.PropertyEditorUi.Slider'. Set values to a 0-1000 range: [{ alias: "minVal", value: 0 }, { alias: "maxVal", value: 1000 }, { alias: "initVal1", value: 0 }, { alias: "initVal2", value: 0 }, { alias: "step", value: 1 }]. Note the ID.
2. Create a data type called '_TestSlider_Narrow' with editorAlias 'Umbraco.Slider' and editorUiAlias 'Umb.PropertyEditorUi.Slider'. Set values to a 0-10 range: [{ alias: "minVal", value: 0 }, { alias: "maxVal", value: 10 }, { alias: "initVal1", value: 0 }, { alias: "initVal2", value: 0 }, { alias: "step", value: 1 }]. Note the ID.
3. Use get-data-type-schemas with both IDs to fetch their schemas in a single batch call. Confirm the schemas differ: the Wide slider's from/to properties should carry a 'maximum' of 1000, the Narrow slider's should be 10.
4. Get available icons using get-icons and pick any icon alias.
5. Create a document type called '_TestSliderWidePage' with alias 'testSliderWidePage', icon from step 4, allowedAsRoot true, with one property: name 'Range', alias 'range', dataTypeId from the Wide data type, tab 'Content'. Note the ID.
6. Create a document type called '_TestSliderNarrowPage' with alias 'testSliderNarrowPage', icon from step 4, allowedAsRoot true, with one property: name 'Range', alias 'range', dataTypeId from the Narrow data type, tab 'Content'. Note the ID.
7. Get the document type schema for '_TestSliderWidePage' using get-document-type-schema. Use it to create a document called '_TestSliderWideDoc' with a from/to value in the 0-1000 range (e.g. from 100 to 750).
8. Get the document type schema for '_TestSliderNarrowPage' using get-document-type-schema. Use it to create a document called '_TestSliderNarrowDoc' with a from/to value in the 0-10 range (e.g. from 1 to 7).
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
