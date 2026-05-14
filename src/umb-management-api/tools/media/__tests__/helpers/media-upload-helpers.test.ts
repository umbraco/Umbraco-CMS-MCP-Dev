import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { jest } from "@jest/globals";

// Mock the validate-file-path module to allow testing without config
jest.unstable_mockModule("../../post/helpers/validate-file-path.js", () => ({
  validateFilePath: jest.fn((filePath: string) => path.resolve(filePath))
}));

// Cloudflare Workers' unenv polyfill throws if fs.writeFileSync is called.
// Mirror that behaviour here so the url/base64 paths regress loudly if anyone
// reintroduces a temp-file write.
let writeFileSyncCalls = 0;
const realWriteFileSync = fs.writeFileSync;
jest.unstable_mockModule("fs", () => {
  const actual = jest.requireActual("fs") as typeof fs;
  return {
    ...actual,
    writeFileSync: ((...args: Parameters<typeof fs.writeFileSync>) => {
      writeFileSyncCalls++;
      return realWriteFileSync.apply(actual, args);
    }) as typeof fs.writeFileSync,
    default: actual,
  };
});

// Import the functions (after mocking)
const { createFilePayload, fetchMediaTypeId } = await import("../../post/helpers/media-upload-helpers.js");

describe("media-upload-helpers", () => {
  beforeEach(() => {
    writeFileSyncCalls = 0;
  });

  describe("createFilePayload - file path source", () => {
    it("should create a ReadStream payload from a file path", async () => {
      const testContent = "test content";
      const testFileName = `test-${Date.now()}-${Math.random()}.txt`;
      const testFilePath = path.join(os.tmpdir(), testFileName);

      fs.writeFileSync(testFilePath, testContent);
      expect(fs.existsSync(testFilePath)).toBe(true);

      try {
        const { data, filename } = await createFilePayload(
          "filePath",
          testFilePath,
          undefined,
          undefined,
          testFileName
        );

        expect(data).toBeInstanceOf(fs.ReadStream);
        expect(filename).toBe(testFileName);

        // Close the stream we opened
        await new Promise<void>((resolve) => {
          (data as fs.ReadStream).on('close', () => resolve());
          (data as fs.ReadStream).close();
        });
      } finally {
        if (fs.existsSync(testFilePath)) {
          fs.unlinkSync(testFilePath);
        }
      }
    });
  });

  describe("createFilePayload - base64 source", () => {
    it("should return a Buffer payload from base64 data without touching the filesystem", async () => {
      const testBase64 = Buffer.from("test content").toString("base64");
      const fileName = "test-base64.txt";

      const { data, filename } = await createFilePayload(
        "base64",
        undefined,
        undefined,
        testBase64,
        fileName
      );

      expect(Buffer.isBuffer(data)).toBe(true);
      expect((data as Buffer).toString()).toBe("test content");
      expect(filename).toBe("test-base64.txt");
      // Workers regression guard
      expect(writeFileSyncCalls).toBe(0);
    });

    it("should append an extension detected from magic bytes when missing", async () => {
      // Minimal PNG signature
      const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      const testBase64 = png.toString("base64");

      const { filename } = await createFilePayload(
        "base64",
        undefined,
        undefined,
        testBase64,
        "no-extension"
      );

      expect(filename).toMatch(/^no-extension\.(png|.+)$/);
    });
  });

  describe("createFilePayload - url source", () => {
    let originalFetch: typeof fetch;

    beforeEach(() => {
      originalFetch = global.fetch;
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it("should return a Buffer payload from a URL without writing a temp file", async () => {
      const responseBytes = new TextEncoder().encode("hello world");
      global.fetch = (async () => new Response(responseBytes, {
        status: 200,
        headers: { "content-type": "text/plain" },
      })) as typeof fetch;

      const { data, filename } = await createFilePayload(
        "url",
        undefined,
        "https://example.com/file.txt",
        undefined,
        "downloaded.txt"
      );

      expect(Buffer.isBuffer(data)).toBe(true);
      expect((data as Buffer).toString()).toBe("hello world");
      expect(filename).toBe("downloaded.txt");
      // Workers regression guard
      expect(writeFileSyncCalls).toBe(0);
    });

    it("should infer the extension from the URL when fileName has none", async () => {
      global.fetch = (async () => new Response(new Uint8Array(), {
        status: 200,
        headers: { "content-type": "image/png" },
      })) as typeof fetch;

      const { filename } = await createFilePayload(
        "url",
        undefined,
        "https://example.com/avatar.png",
        undefined,
        "avatar"
      );

      expect(filename).toBe("avatar.png");
    });

    it("should fall back to a content-type derived extension", async () => {
      global.fetch = (async () => new Response(new Uint8Array(), {
        status: 200,
        headers: { "content-type": "image/jpeg" },
      })) as typeof fetch;

      const { filename } = await createFilePayload(
        "url",
        undefined,
        "https://example.com/no-extension",
        undefined,
        "photo"
      );

      // `mime-types` returns the canonical extension, which is `jpg` for image/jpeg.
      expect(filename).toBe("photo.jpg");
    });
  });

  describe("fetchMediaTypeId", () => {

    describe("custom media types", () => {
      it("should query API for custom media type", async () => {
        const customId = "custom-guid-12345";
        const mockFn: any = jest.fn();
        mockFn.mockResolvedValue({
          items: [
            { name: "Custom Type", id: customId }
          ]
        });
        const mockClient: any = {
          getItemMediaTypeSearch: mockFn
        };

        const id = await fetchMediaTypeId(mockClient, "Custom Type");

        expect(id).toBe(customId);
        expect(mockClient.getItemMediaTypeSearch).toHaveBeenCalledWith({ query: "Custom Type" });
      });

      it("should throw error for non-existent custom type", async () => {
        const mockFn: any = jest.fn();
        mockFn.mockResolvedValue({
          items: []
        });
        const mockClient: any = {
          getItemMediaTypeSearch: mockFn
        };

        await expect(
          fetchMediaTypeId(mockClient, "NonExistent")
        ).rejects.toThrow("Media type 'NonExistent' not found");

        expect(mockClient.getItemMediaTypeSearch).toHaveBeenCalledWith({ query: "NonExistent" });
      });

      it("should handle custom type with case-insensitive search", async () => {
        const customId = "custom-guid-67890";
        const mockFn: any = jest.fn();
        mockFn.mockResolvedValue({
          items: [
            { name: "My Custom Type", id: customId },
            { name: "Other Type", id: "other-id" }
          ]
        });
        const mockClient: any = {
          getItemMediaTypeSearch: mockFn
        };

        const id = await fetchMediaTypeId(mockClient, "my custom type");

        expect(id).toBe(customId);
        expect(mockClient.getItemMediaTypeSearch).toHaveBeenCalledWith({ query: "my custom type" });
      });
    });
  });

});
