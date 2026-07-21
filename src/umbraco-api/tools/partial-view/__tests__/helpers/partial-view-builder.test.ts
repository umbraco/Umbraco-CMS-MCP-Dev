import { PartialViewBuilder } from "./partial-view-builder.js";
import { PartialViewHelper } from "./partial-view-helper.js";
import { jest } from "@jest/globals";

const TEST_PARTIAL_VIEW_NAME = "_TestPartialViewBuilder";
const TEST_CONTENT = "@* Test partial view content *@\n<p>Test Builder Content</p>";

describe("PartialViewBuilder", () => {
  let originalConsoleError: typeof console.error;
  let builder: PartialViewBuilder;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
    builder = new PartialViewBuilder();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
    await PartialViewHelper.cleanup(TEST_PARTIAL_VIEW_NAME + ".cshtml");
  });

  it("should build a partial view model with name and content", () => {
    const model = builder
      .withName(TEST_PARTIAL_VIEW_NAME)
      .withContent(TEST_CONTENT)
      .build();

    expect(model.name).toBe(TEST_PARTIAL_VIEW_NAME + ".cshtml");
    expect(model.content).toBe(TEST_CONTENT);
  });

  it("should throw error when building without name", () => {
    expect(() => {
      builder.withContent(TEST_CONTENT).build();
    }).toThrow("Name is required for partial view");
  });

  it("should throw error when building without content", () => {
    expect(() => {
      builder.withName(TEST_PARTIAL_VIEW_NAME).build();
    }).toThrow("Content is required for partial view");
  });

  it("should create a partial view and return path", async () => {
    await builder
      .withName(TEST_PARTIAL_VIEW_NAME)
      .withContent(TEST_CONTENT)
      .create();

    const path = builder.getPath();
    expect(path).toContain(TEST_PARTIAL_VIEW_NAME);

    // Verify it was created
    const exists = await PartialViewHelper.verifyPartialView(path);
    expect(exists).toBe(true);
  });

  it("should verify created partial view exists", async () => {
    await builder
      .withName(TEST_PARTIAL_VIEW_NAME)
      .withContent(TEST_CONTENT)
      .create();

    const isVerified = await builder.verify();
    expect(isVerified).toBe(true);
  });

  it("should get created item details", async () => {
    await builder
      .withName(TEST_PARTIAL_VIEW_NAME)
      .withContent(TEST_CONTENT)
      .create();

    const item = builder.getItem();
    expect(item.path).toContain(TEST_PARTIAL_VIEW_NAME);
  });

  it("should throw error when trying to get path before creation", () => {
    expect(() => {
      builder.getPath();
    }).toThrow("No partial view has been created yet");
  });

  it("should throw error when trying to verify before creation", async () => {
    await expect(builder.verify()).rejects.toThrow("No partial view has been created yet");
  });
});