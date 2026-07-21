import { DocumentVersionBuilder } from "./document-version-builder.js";
import { jest } from "@jest/globals";

const TEST_DOCUMENT_NAME = "_Test Document for Versions";

describe("DocumentVersionBuilder", () => {
  let builder: DocumentVersionBuilder;
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
    builder = new DocumentVersionBuilder();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
    await builder.cleanup();
  });

  it("should create a document", async () => {
    await builder
      .withName(TEST_DOCUMENT_NAME)
      .withRootDocumentType()
      .create();

    expect(builder.getId()).toBeDefined();
    expect(builder.getItem()).toBeDefined();
    expect(builder.getItem().variants[0].name).toBe(TEST_DOCUMENT_NAME);
  });

  it("should create and publish a document to generate versions", async () => {
    await builder
      .withName(TEST_DOCUMENT_NAME + " Published")
      .withRootDocumentType()
      .create();

    const documentId = builder.getId();
    expect(documentId).toBeDefined();

    // Publish the document to create a version
    await builder.publish();

    // Document should still exist and be accessible
    expect(builder.getItem()).toBeDefined();
  });

  it("should create, publish and update a document to generate multiple versions", async () => {
    await builder
      .withName(TEST_DOCUMENT_NAME + " Multiple Versions")
      .withRootDocumentType()
      .create();

    const documentId = builder.getId();
    expect(documentId).toBeDefined();

    // Publish to create first version
    await builder.publish();

    // Update to create another version
    await builder.updateContent();

    // Document should still exist and be accessible
    expect(builder.getItem()).toBeDefined();
  });

  it("should throw error when trying to get ID before creation", () => {
    expect(() => builder.getId()).toThrow("No document has been created yet");
  });

  it("should throw error when trying to get item before creation", () => {
    expect(() => builder.getItem()).toThrow("No document has been created yet");
  });

  it("should throw error when trying to publish before creation", async () => {
    await expect(builder.publish()).rejects.toThrow("No document has been created yet");
  });

  it("should throw error when trying to update before creation", async () => {
    await expect(builder.updateContent()).rejects.toThrow("No document has been created yet");
  });
});