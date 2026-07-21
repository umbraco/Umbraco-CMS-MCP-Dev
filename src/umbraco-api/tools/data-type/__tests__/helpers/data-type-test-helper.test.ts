import { DataTypeBuilder } from "./data-type-builder.js";
import { DataTypeTestHelper } from "./data-type-test-helper.js";

describe("DataTypeTestHelper", () => {
  const TEST_DATATYPE_CLEANUP_NAME = "Test Integration DataType Cleanup";

  // Clean up any test data types that might be left over from previous test runs
  beforeAll(async () => {
    await DataTypeTestHelper.cleanup(TEST_DATATYPE_CLEANUP_NAME);
  });

  // Clean up after all tests
  afterAll(async () => {
    await DataTypeTestHelper.cleanup(TEST_DATATYPE_CLEANUP_NAME);
  });

  describe("cleanup and cleanupById", () => {
    it("should cleanup data type by name", async () => {
      // Create a data type using builder
      const builder = await new DataTypeBuilder()
        .withName(TEST_DATATYPE_CLEANUP_NAME)
        .withEditorAlias("Umbraco.TextBox")
        .withEditorUiAlias("textbox")
        .create();
      expect(builder).toBeDefined();

      // Clean it up
      await DataTypeTestHelper.cleanup(TEST_DATATYPE_CLEANUP_NAME);

      // Verify it's gone
      const found = await DataTypeTestHelper.findDataType(
        TEST_DATATYPE_CLEANUP_NAME
      );
      expect(found).toBeUndefined();
    });
  });
});
