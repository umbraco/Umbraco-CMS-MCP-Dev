import { DocumentTypeTestHelper } from "./document-type-test-helper.js";
import { DocumentTypeBuilder } from "./document-type-builder.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

describe("DocumentTypeTestHelper", () => {
  const TEST_DOCTYPE_NAME = "_Test Helper DocumentType";
  setupTestEnvironment();

  afterEach(async () => {
    await DocumentTypeTestHelper.cleanup(TEST_DOCTYPE_NAME);
  });

  describe("findByName", () => {
    it("should find item by name in array", () => {
      const items = [
        {
          name: "Test1",
          id: "1",
          hasChildren: false,
          isFolder: false,
          isElement: false,
          icon: "icon-test",
          flags: [],
        },
        {
          name: TEST_DOCTYPE_NAME,
          id: "2",
          hasChildren: false,
          isFolder: false,
          isElement: false,
          icon: "icon-test",
          flags: [],
        },
        {
          name: "Test3",
          id: "3",
          hasChildren: false,
          isFolder: false,
          isElement: false,
          icon: "icon-test",
          flags: [],
        },
      ];

      const result = DocumentTypeTestHelper.findByName(
        items,
        TEST_DOCTYPE_NAME
      );
      expect(result).toBeDefined();
      expect(result?.name).toBe(TEST_DOCTYPE_NAME);
      expect(result?.id).toBe("2");
    });

    it("should return undefined when item not found", () => {
      const items = [
        {
          name: "Test1",
          id: "1",
          hasChildren: false,
          isFolder: false,
          isElement: false,
          icon: "icon-test",
          flags: [],
        },
        {
          name: "Test2",
          id: "2",
          hasChildren: false,
          isFolder: false,
          isElement: false,
          icon: "icon-test",
          flags: [],
        },
      ];

      const result = DocumentTypeTestHelper.findByName(
        items,
        TEST_DOCTYPE_NAME
      );
      expect(result).toBeUndefined();
    });

    it("should handle empty array", () => {
      const result = DocumentTypeTestHelper.findByName([], TEST_DOCTYPE_NAME);
      expect(result).toBeUndefined();
    });
  });

  describe("cleanup", () => {
    it("should cleanup created document type", async () => {
      // Create a document type
      const builder = await new DocumentTypeBuilder()
        .withName(TEST_DOCTYPE_NAME)
        .create();

      const id = builder.getId();
      expect(id).toBeDefined();

      // Clean it up
      await DocumentTypeTestHelper.cleanup(TEST_DOCTYPE_NAME);

      // Verify it's gone
      const found = await DocumentTypeTestHelper.findDocumentType(
        TEST_DOCTYPE_NAME
      );
      expect(found).toBeUndefined();
    });

    it("should handle non-existent document type", async () => {
      await expect(
        DocumentTypeTestHelper.cleanup("NonExistentDocType")
      ).resolves.not.toThrow();
    });
  });

  describe("findDocumentType", () => {
    it("should find created document type", async () => {
      // Create a document type
      const builder = await new DocumentTypeBuilder()
        .withName(TEST_DOCTYPE_NAME)
        .create();

      // Find it
      const found = await DocumentTypeTestHelper.findDocumentType(
        TEST_DOCTYPE_NAME
      );
      expect(found).toBeDefined();
      expect(found?.name).toBe(TEST_DOCTYPE_NAME);
      expect(found?.id).toBe(builder.getId());
    });

    it("should return undefined for non-existent document type", async () => {
      const found = await DocumentTypeTestHelper.findDocumentType(
        "NonExistentDocType"
      );
      expect(found).toBeUndefined();
    });
  });
});
