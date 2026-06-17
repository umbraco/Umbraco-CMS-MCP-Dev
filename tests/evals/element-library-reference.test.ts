import { describe, it } from "@jest/globals";
import { setupConsoleMock, runScenarioTest } from "@umbraco-cms/mcp-server-sdk/evals";
import "./helpers/e2e-setup.js";

// Exercises the Element Library end-to-end: an element type backs reusable
// library elements, and a content document type references one of those
// elements through an element-picker property (Umbraco.ContentPicker pointed
// at the element). This mirrors the wiring proven by the
// get-element-folder-referenced-descendants integration test.
const ELEMENT_LIBRARY_TOOLS = [
  "get-icons",
  "find-data-type",
  "create-data-type",
  "delete-data-type",
  "create-element-type",
  "create-document-type",
  "delete-document-type",
  "get-document-type-by-id",
  "create-element",
  "search-element",
  "get-element-root",
  "get-element-by-id",
  "delete-element",
  "create-document",
  "get-document-by-id",
  "delete-document",
] as const;

describe("element library reference eval tests", () => {
  setupConsoleMock();

  it("should create an element-picker document type, an element type, a library element and a content node that references it",
    runScenarioTest({
      prompt: `Complete these tasks in order. IMPORTANT: If any step fails because an item already exists, delete the existing item first and retry. Keep track of every ID returned so you can use it in later steps and delete it during cleanup.

1. Use get-icons and pick any valid icon alias to reuse for the types you create.
2. Use find-data-type to find the built-in 'Textstring' data type and note its ID. This is the text editor for the element type's property.
3. Create an ELEMENT TYPE using create-element-type. Name it '_TestLibElementType', alias 'testLibElementType', icon from step 1. Add one property: name 'Heading', alias 'heading', dataTypeId set to the Textstring data type ID from step 2, tab 'Content'. Note the element type ID.
4. Create a data type to act as the element picker using create-data-type. Name it '_TestElementPicker', editorAlias 'Umbraco.ContentPicker', editorUiAlias 'Umb.PropertyEditorUi.DocumentPicker'. Note the data type ID.
5. Create a content DOCUMENT TYPE using create-document-type. Name it '_TestElementHostPage', alias 'testElementHostPage', icon from step 1, allowedAsRoot true. Add one property: name 'Featured Element', alias 'featuredElement', dataTypeId set to the element picker data type ID from step 4, tab 'Content'. Note the document type ID.
6. Create a library ELEMENT using create-element of the element type from step 3. Set documentTypeId to the element type ID, name '_TestLibraryElement', and set the 'heading' property value to 'Reusable library heading'. Note the element ID returned.
7. Confirm the element exists in the library: use search-element (or get-element-root) to find '_TestLibraryElement' and verify its ID matches the one returned in step 6.
8. Create a CONTENT NODE using create-document of the host document type from step 5. Set the name to '_TestElementHostDoc' and set the 'featuredElement' property value to the library element ID from step 6 (the ContentPicker value is the element's GUID string).
9. Read the content node back with get-document-by-id and verify the 'featuredElement' property value equals the library element ID, confirming the content node references the library element.
10. Clean up everything you created: delete the content node with delete-document, the library element with delete-element, the host document type and the element type with delete-document-type, and the element picker data type with delete-data-type.
11. When successfully completed, say 'The element library reference workflow has completed successfully'`,
      tools: ELEMENT_LIBRARY_TOOLS,
      requiredTools: [
        "create-element-type",
        "create-data-type",
        "create-document-type",
        "create-element",
        "create-document",
        "get-document-by-id",
      ],
      successPattern: "element library reference workflow has completed successfully",
      options: { maxTurns: 30 },
    }),
    300000
  );
});
