import { validateFilePath } from "../../post/helpers/validate-file-path.js";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

describe("validate-file-path", () => {
  let tempDir: string;
  let testFile: string;
  let testSymlink: string;
  let outsideDir: string;
  let outsideFile: string;
  let originalEnvValue: string | undefined;

  beforeEach(() => {
    // Save and clear UMBRACO_ALLOWED_MEDIA_PATHS for isolated testing
    originalEnvValue = process.env.UMBRACO_ALLOWED_MEDIA_PATHS;
    delete process.env.UMBRACO_ALLOWED_MEDIA_PATHS;

    // Create temporary test directory structure
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "media-test-"));
    testFile = path.join(tempDir, "test.jpg");
    testSymlink = path.join(tempDir, "symlink.jpg");
    outsideDir = fs.mkdtempSync(path.join(os.tmpdir(), "outside-"));
    outsideFile = path.join(outsideDir, "outside.jpg");

    // Create test files
    fs.writeFileSync(testFile, "test content");
    fs.writeFileSync(outsideFile, "outside content");
  });

  afterEach(() => {
    // Restore original environment variable
    if (originalEnvValue !== undefined) {
      process.env.UMBRACO_ALLOWED_MEDIA_PATHS = originalEnvValue;
    } else {
      delete process.env.UMBRACO_ALLOWED_MEDIA_PATHS;
    }

    // Cleanup
    try {
      if (fs.existsSync(testSymlink)) fs.unlinkSync(testSymlink);
      if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
      if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir);
      if (fs.existsSync(outsideFile)) fs.unlinkSync(outsideFile);
      if (fs.existsSync(outsideDir)) fs.rmdirSync(outsideDir);
    } catch (e) {
      // Ignore cleanup errors
    }
  });

  describe("when UMBRACO_ALLOWED_MEDIA_PATHS is not configured", () => {
    it("should reject all file path uploads with clear error message", async () => {
      await expect(validateFilePath(testFile, undefined)).rejects.toThrow(
        "File path uploads are disabled. To enable, set UMBRACO_ALLOWED_MEDIA_PATHS environment variable"
      );
    });
  });

  describe("when UMBRACO_ALLOWED_MEDIA_PATHS is empty array", () => {
    it("should reject all file path uploads", async () => {
      await expect(validateFilePath(testFile, [])).rejects.toThrow(
        "File path uploads are disabled"
      );
    });
  });

  describe("when UMBRACO_ALLOWED_MEDIA_PATHS is configured", () => {
    it("should allow files within allowed directory", async () => {
      const result = await validateFilePath(testFile, [tempDir]);
      expect(result).toBe(path.resolve(testFile));
    });

    it("should reject files outside allowed directories", async () => {
      await expect(validateFilePath(outsideFile, [tempDir])).rejects.toThrow(
        `File path "${outsideFile}" is not in an allowed directory`
      );
    });

    it("should prevent path traversal attacks", async () => {
      const traversalPath = path.join(tempDir, "..", "..", "etc", "passwd");
      await expect(validateFilePath(traversalPath, [tempDir])).rejects.toThrow(
        "is not in an allowed directory"
      );
    });

    it("should reject non-existent files", async () => {
      const nonExistent = path.join(tempDir, "nonexistent.jpg");
      await expect(validateFilePath(nonExistent, [tempDir])).rejects.toThrow(
        "File not found"
      );
    });

    it("should normalize relative paths before validation", async () => {
      const relativePath = path.relative(process.cwd(), testFile);
      const result = await validateFilePath(relativePath, [tempDir]);
      expect(result).toBe(path.resolve(testFile));
    });
  });

  describe("symlink handling", () => {
    it("should allow symlinks pointing to files within allowed directories", async () => {
      fs.symlinkSync(testFile, testSymlink);
      const result = await validateFilePath(testSymlink, [tempDir]);
      expect(result).toBe(path.resolve(testSymlink));
    });

    it("should reject symlinks pointing to files outside allowed directories", async () => {
      fs.symlinkSync(outsideFile, testSymlink);
      await expect(validateFilePath(testSymlink, [tempDir])).rejects.toThrow(
        "is a symbolic link to"
      );
      await expect(validateFilePath(testSymlink, [tempDir])).rejects.toThrow(
        "which is outside allowed directories"
      );
    });
  });

  describe("multiple allowed paths", () => {
    let secondTempDir: string;
    let secondTestFile: string;

    beforeEach(() => {
      secondTempDir = fs.mkdtempSync(path.join(os.tmpdir(), "media-test-2-"));
      secondTestFile = path.join(secondTempDir, "test2.jpg");
      fs.writeFileSync(secondTestFile, "test content 2");
    });

    afterEach(() => {
      try {
        if (fs.existsSync(secondTestFile)) fs.unlinkSync(secondTestFile);
        if (fs.existsSync(secondTempDir)) fs.rmdirSync(secondTempDir);
      } catch (e) {
        // Ignore cleanup errors
      }
    });

    it("should allow files from first allowed directory", async () => {
      const result = await validateFilePath(testFile, [tempDir, secondTempDir]);
      expect(result).toBe(path.resolve(testFile));
    });

    it("should allow files from second allowed directory", async () => {
      const result = await validateFilePath(secondTestFile, [tempDir, secondTempDir]);
      expect(result).toBe(path.resolve(secondTestFile));
    });

    it("should reject files outside all allowed directories", async () => {
      await expect(validateFilePath(outsideFile, [tempDir, secondTempDir])).rejects.toThrow(
        "is not in an allowed directory"
      );
    });
  });
});
