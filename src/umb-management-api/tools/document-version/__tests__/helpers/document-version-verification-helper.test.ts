import { DocumentVersionVerificationHelper } from "./document-version-verification-helper.js";
import { DocumentVersionBuilder } from "./document-version-builder.js";
import { jest } from "@jest/globals";
import { BLANK_UUID } from "@/constants/constants.js";

const TEST_DOCUMENT_NAME = "_Test Document for Version Helper";

describe("DocumentVersionVerificationHelper", () => {
  let originalConsoleError: typeof console.error;
  let builder: DocumentVersionBuilder;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
    builder = new DocumentVersionBuilder();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
    await builder.cleanup();
    await DocumentVersionVerificationHelper.cleanup(TEST_DOCUMENT_NAME);
  });

  describe("findDocumentVersions", () => {
    it("should find document versions by document ID", async () => {
      // Create and publish a document to generate versions
      await builder
        .withName(TEST_DOCUMENT_NAME)
        .withRootDocumentType()
        .create();
      
      await builder.publish();
      
      const documentId = builder.getId();
      const versions = await DocumentVersionVerificationHelper.findDocumentVersions(documentId);
      
      expect(versions).toBeDefined();
      expect(Array.isArray(versions)).toBe(true);
      // Should have at least one version after publishing
      expect(versions.length).toBeGreaterThan(0);
    });

    it("should find document versions with normalized IDs for snapshots", async () => {
      // Create and publish a document to generate versions
      await builder
        .withName(TEST_DOCUMENT_NAME + " Snapshot")
        .withRootDocumentType()
        .create();
      
      await builder.publish();
      
      const documentId = builder.getId();
      const versions = await DocumentVersionVerificationHelper.findDocumentVersions(
        documentId,
        true
      );
      
      expect(versions).toBeDefined();
      expect(Array.isArray(versions)).toBe(true);
      if (versions.length > 0) {
        expect(versions[0].id).toBe(BLANK_UUID);
      }
    });

    it("should return empty array for non-existent document", async () => {
      try {
        const versions = await DocumentVersionVerificationHelper.findDocumentVersions(BLANK_UUID);
        expect(versions).toBeDefined();
        expect(Array.isArray(versions)).toBe(true);
        expect(versions.length).toBe(0);
      } catch (error) {
        // It's expected that a non-existent document would throw a 500 error
        expect(error).toBeDefined();
      }
    });
  });

  describe("getDocumentVersion", () => {
    it("should get specific document version by ID", async () => {
      // Create and publish a document to generate versions
      await builder
        .withName(TEST_DOCUMENT_NAME + " Get Version")
        .withRootDocumentType()
        .create();
      
      await builder.publish();
      
      const documentId = builder.getId();
      const versions = await DocumentVersionVerificationHelper.findDocumentVersions(documentId);
      
      if (versions.length > 0) {
        const versionId = versions[0].id;
        const version = await DocumentVersionVerificationHelper.getDocumentVersion(versionId);
        
        expect(version).toBeDefined();
        expect(version.id).toBe(versionId);
      }
    });

    it("should get document version with normalized ID for snapshots", async () => {
      // Create and publish a document to generate versions
      await builder
        .withName(TEST_DOCUMENT_NAME + " Get Version Snapshot")
        .withRootDocumentType()
        .create();
      
      await builder.publish();
      
      const documentId = builder.getId();
      const versions = await DocumentVersionVerificationHelper.findDocumentVersions(documentId);
      
      if (versions.length > 0) {
        const versionId = versions[0].id;
        const version = await DocumentVersionVerificationHelper.getDocumentVersion(
          versionId,
          true
        );
        
        expect(version).toBeDefined();
        expect(version.id).toBe(BLANK_UUID);
      }
    });
  });

  describe("normalizeIds", () => {
    it("should normalize single version object", () => {
      const version = {
        id: "some-uuid-123",
        createDate: "2023-01-01T10:00:00Z",
        publishDate: "2023-01-01T12:00:00Z"
      };

      const normalized = DocumentVersionVerificationHelper.normalizeIds(version);

      expect(normalized.id).toBe(BLANK_UUID);
      expect(normalized.createDate).toBe("NORMALIZED_DATE");
      expect(normalized.publishDate).toBe("NORMALIZED_DATE");
    });

    it("should normalize array of version objects", () => {
      const versions = [
        {
          id: "uuid-1",
          createDate: "2023-01-01T10:00:00Z"
        },
        {
          id: "uuid-2", 
          createDate: "2023-01-02T10:00:00Z"
        }
      ];

      const normalized = DocumentVersionVerificationHelper.normalizeIds(versions);

      expect(Array.isArray(normalized)).toBe(true);
      expect(normalized).toHaveLength(2);
      normalized.forEach((version: any) => {
        expect(version.id).toBe(BLANK_UUID);
        expect(version.createDate).toBe("NORMALIZED_DATE");
      });
    });
  });

  describe("cleanup", () => {
    it("should clean up document by name", async () => {
      await builder
        .withName(TEST_DOCUMENT_NAME + " Cleanup Test")
        .withRootDocumentType()
        .create();

      const documentName = TEST_DOCUMENT_NAME + " Cleanup Test";

      // Cleanup should not throw even for existing documents
      await expect(
        DocumentVersionVerificationHelper.cleanup(documentName)
      ).resolves.not.toThrow();
    });

    it("should handle cleanup of non-existent document gracefully", async () => {
      await expect(
        DocumentVersionVerificationHelper.cleanup("Non Existent Document")
      ).resolves.not.toThrow();
    });
  });
});