import { StylesheetBuilder } from "./stylesheet-builder.js";
import { StylesheetHelper } from "./stylesheet-helper.js";
import { jest } from "@jest/globals";

const TEST_STYLESHEET_NAME = "_TestStylesheetBuilder";
const TEST_CONTENT = "/* Test stylesheet content */\nbody {\n  background-color: #f0f0f0;\n}";

describe("StylesheetBuilder", () => {
  let originalConsoleError: typeof console.error;
  let builder: StylesheetBuilder;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
    builder = new StylesheetBuilder();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
    await StylesheetHelper.cleanup(TEST_STYLESHEET_NAME + ".css");
  });

  it("should build a stylesheet model with name and content", () => {
    const model = builder
      .withName(TEST_STYLESHEET_NAME)
      .withContent(TEST_CONTENT)
      .build();

    expect(model.name).toBe(TEST_STYLESHEET_NAME + ".css");
    expect(model.content).toBe(TEST_CONTENT);
  });

  it("should throw error when building without name", () => {
    expect(() => {
      builder.withContent(TEST_CONTENT).build();
    }).toThrow("Name is required for stylesheet");
  });

  it("should throw error when building without content", () => {
    expect(() => {
      builder.withName(TEST_STYLESHEET_NAME).build();
    }).toThrow("Content is required for stylesheet");
  });

  it("should create a stylesheet and return path", async () => {
    await builder
      .withName(TEST_STYLESHEET_NAME)
      .withContent(TEST_CONTENT)
      .create();

    const path = builder.getPath();
    expect(path).toContain(TEST_STYLESHEET_NAME);

    // Verify it was created
    const exists = await StylesheetHelper.verifyStylesheet(path);
    expect(exists).toBe(true);
  });

  it("should verify created stylesheet exists", async () => {
    await builder
      .withName(TEST_STYLESHEET_NAME)
      .withContent(TEST_CONTENT)
      .create();

    const isVerified = await builder.verify();
    expect(isVerified).toBe(true);
  });

  it("should get created item details", async () => {
    await builder
      .withName(TEST_STYLESHEET_NAME)
      .withContent(TEST_CONTENT)
      .create();

    const item = builder.getItem();
    expect(item.path).toContain(TEST_STYLESHEET_NAME);
  });

  it("should throw error when trying to get path before creation", () => {
    expect(() => {
      builder.getPath();
    }).toThrow("No stylesheet has been created yet");
  });

  it("should throw error when trying to verify before creation", async () => {
    await expect(builder.verify()).rejects.toThrow("No stylesheet has been created yet");
  });
});