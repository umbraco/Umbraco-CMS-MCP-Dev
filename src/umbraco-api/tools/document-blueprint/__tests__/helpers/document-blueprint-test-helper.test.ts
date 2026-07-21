import { DocumentBlueprintBuilder } from "./document-blueprint-builder.js";
import { DocumentBlueprintTestHelper } from "./document-blueprint-test-helper.js";

describe("DocumentBlueprintVerificationHelper", () => {
  const TEST_BLUEPRINT_CLEANUP_NAME = "Test Integration Blueprint Cleanup";

  // Clean up any test blueprints that might be left over from previous test runs
  beforeAll(async () => {
    await DocumentBlueprintTestHelper.cleanup(TEST_BLUEPRINT_CLEANUP_NAME);
  });

  // Clean up after all tests
  afterAll(async () => {
    await DocumentBlueprintTestHelper.cleanup(TEST_BLUEPRINT_CLEANUP_NAME);
  });

  describe("cleanup and cleanupById", () => {
    it("should cleanup blueprint by name", async () => {
      // Create a blueprint using builder
      const builder = await new DocumentBlueprintBuilder(
        TEST_BLUEPRINT_CLEANUP_NAME
      ).create();
      expect(builder).toBeDefined();

      // Clean it up
      await DocumentBlueprintTestHelper.cleanup(TEST_BLUEPRINT_CLEANUP_NAME);

      // Verify it's gone
      const found = await DocumentBlueprintTestHelper.findDocumentBlueprint(
        TEST_BLUEPRINT_CLEANUP_NAME
      );
      expect(found).toBeUndefined();
    });
  });
});
