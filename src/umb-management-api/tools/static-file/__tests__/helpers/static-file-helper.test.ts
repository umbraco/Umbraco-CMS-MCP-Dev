import { StaticFileHelper } from "./static-file-helper.js";
import { jest } from "@jest/globals";
import { StaticFileItemResponseModel } from "@/umb-management-api/schemas/staticFileItemResponseModel.js";

const TEST_STATIC_FILE_NAME = "test-file.txt";
const TEST_FOLDER_NAME = "test-folder";
const TEST_PATH = "/test/path";

describe("StaticFileHelper", () => {
  let originalConsoleError: typeof console.error;
  let originalConsoleLog: typeof console.log;

  beforeEach(() => {
    originalConsoleError = console.error;
    originalConsoleLog = console.log;
    console.error = jest.fn();
    console.log = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
  });

  describe("findByName", () => {
    it("should find static file by name", () => {
      const items: StaticFileItemResponseModel[] = [
        {
          path: "/test.txt",
          name: "test.txt",
          isFolder: false
        },
        {
          path: "/folder",
          name: "folder",
          isFolder: true
        }
      ];

      const result = StaticFileHelper.findByName(items, "test.txt");
      expect(result).toBeDefined();
      expect(result?.name).toBe("test.txt");
      expect(result?.isFolder).toBe(false);
    });

    it("should return undefined when static file not found", () => {
      const items: StaticFileItemResponseModel[] = [
        {
          path: "/test.txt",
          name: "test.txt",
          isFolder: false
        }
      ];

      const result = StaticFileHelper.findByName(items, "nonexistent.txt");
      expect(result).toBeUndefined();
    });
  });

  describe("findByPath", () => {
    it("should find static file by path", () => {
      const items: StaticFileItemResponseModel[] = [
        {
          path: "/test/file.txt",
          name: "file.txt",
          isFolder: false
        },
        {
          path: "/test/folder",
          name: "folder",
          isFolder: true
        }
      ];

      const result = StaticFileHelper.findByPath(items, "/test/file.txt");
      expect(result).toBeDefined();
      expect(result?.path).toBe("/test/file.txt");
      expect(result?.name).toBe("file.txt");
    });

    it("should return undefined when path not found", () => {
      const items: StaticFileItemResponseModel[] = [
        {
          path: "/test/file.txt",
          name: "file.txt",
          isFolder: false
        }
      ];

      const result = StaticFileHelper.findByPath(items, "/nonexistent/path.txt");
      expect(result).toBeUndefined();
    });
  });

  describe("normalizeStaticFileItems", () => {
    it("should normalize single static file item", () => {
      const item: StaticFileItemResponseModel = {
        path: "/test.txt",
        name: "test.txt",
        isFolder: false,
        parent: {
          path: "/"
        }
      };

      const result = StaticFileHelper.normalizeStaticFileItems(item);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content[0]).toBeDefined();
      expect(result.content[0].type).toBe("text");

      const parsedContent = JSON.parse(result.content[0].text);
      expect(parsedContent.path).toBe("/test.txt");
      expect(parsedContent.name).toBe("test.txt");
      expect(parsedContent.isFolder).toBe(false);
    });

    it("should normalize array of static file items", () => {
      const items: StaticFileItemResponseModel[] = [
        {
          path: "/test1.txt",
          name: "test1.txt",
          isFolder: false
        },
        {
          path: "/folder",
          name: "folder",
          isFolder: true
        }
      ];

      const result = StaticFileHelper.normalizeStaticFileItems(items);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content[0]).toBeDefined();
      expect(result.content[0].type).toBe("text");

      const parsedContent = JSON.parse(result.content[0].text);
      expect(parsedContent.items).toBeDefined();
      expect(parsedContent.items).toHaveLength(2);
      expect(parsedContent.items[0].name).toBe("test1.txt");
      expect(parsedContent.items[1].name).toBe("folder");
    });
  });

  describe("verifyFileSystemStructure", () => {
    it("should return true for valid file system structure", () => {
      const items: StaticFileItemResponseModel[] = [
        {
          path: "/test.txt",
          name: "test.txt",
          isFolder: false,
          parent: {
            path: "/"
          }
        },
        {
          path: "/folder",
          name: "folder",
          isFolder: true
        }
      ];

      const result = StaticFileHelper.verifyFileSystemStructure(items);
      expect(result).toBe(true);
    });

    it("should return false for invalid file system structure - missing path", () => {
      const items = [
        {
          name: "test.txt",
          isFolder: false
        }
      ] as StaticFileItemResponseModel[];

      const result = StaticFileHelper.verifyFileSystemStructure(items);
      expect(result).toBe(false);
    });

    it("should return false for invalid file system structure - missing name", () => {
      const items = [
        {
          path: "/test.txt",
          isFolder: false
        }
      ] as StaticFileItemResponseModel[];

      const result = StaticFileHelper.verifyFileSystemStructure(items);
      expect(result).toBe(false);
    });

    it("should return false for invalid file system structure - missing isFolder", () => {
      const items = [
        {
          path: "/test.txt",
          name: "test.txt"
        }
      ] as StaticFileItemResponseModel[];

      const result = StaticFileHelper.verifyFileSystemStructure(items);
      expect(result).toBe(false);
    });

    it("should return false for invalid parent structure", () => {
      const items: StaticFileItemResponseModel[] = [
        {
          path: "/test.txt",
          name: "test.txt",
          isFolder: false,
          parent: {
            path: ""
          }
        }
      ];

      const result = StaticFileHelper.verifyFileSystemStructure(items);
      expect(result).toBe(false);
    });

    it("should return false for non-array input", () => {
      const result = StaticFileHelper.verifyFileSystemStructure("not an array" as any);
      expect(result).toBe(false);
    });
  });

  describe("cleanup", () => {
    it("should log that no cleanup is needed for read-only endpoint", async () => {
      await StaticFileHelper.cleanup(TEST_STATIC_FILE_NAME);

      expect(console.log).toHaveBeenCalledWith(
        `StaticFile cleanup called for ${TEST_STATIC_FILE_NAME} - no action needed (read-only endpoint)`
      );
    });
  });

  describe("Integration tests", () => {
    it("should have consistent API methods available", () => {
      // Verify all expected static methods exist
      expect(typeof StaticFileHelper.findStaticFiles).toBe("function");
      expect(typeof StaticFileHelper.findByName).toBe("function");
      expect(typeof StaticFileHelper.findByPath).toBe("function");
      expect(typeof StaticFileHelper.getRootItems).toBe("function");
      expect(typeof StaticFileHelper.getChildren).toBe("function");
      expect(typeof StaticFileHelper.getAncestors).toBe("function");
      expect(typeof StaticFileHelper.normalizeStaticFileItems).toBe("function");
      expect(typeof StaticFileHelper.verifyFileSystemStructure).toBe("function");
      expect(typeof StaticFileHelper.findItemRecursively).toBe("function");
      expect(typeof StaticFileHelper.cleanup).toBe("function");
    });

    it("should handle empty arrays correctly", () => {
      const emptyItems: StaticFileItemResponseModel[] = [];

      const findByNameResult = StaticFileHelper.findByName(emptyItems, "test.txt");
      expect(findByNameResult).toBeUndefined();

      const findByPathResult = StaticFileHelper.findByPath(emptyItems, "/test.txt");
      expect(findByPathResult).toBeUndefined();

      const verifyStructureResult = StaticFileHelper.verifyFileSystemStructure(emptyItems);
      expect(verifyStructureResult).toBe(true); // Empty array is valid

      const normalizeResult = StaticFileHelper.normalizeStaticFileItems(emptyItems);
      expect(normalizeResult).toBeDefined();
    });
  });
});