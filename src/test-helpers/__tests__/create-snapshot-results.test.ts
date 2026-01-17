import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createSnapshotResult,
  normalizeErrorResponse,
  normalizeObject,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("createSnapshotResult", () => {
  const TEST_UUID = "12345678-1234-1234-1234-123456789012";

  describe("basic functionality", () => {
    it("should return the original result if no structuredContent is present", () => {
      // Arrange
      const input = { someOtherField: "value" };

      // Act
      const result = createSnapshotResult(input);

      // Assert
      expect(result).toEqual(input);
    });

    it("should handle structuredContent with null value", () => {
      // Arrange
      const input = { structuredContent: null };

      // Act
      const result = createSnapshotResult(input);

      // Assert
      expect(result.structuredContent).toBeNull();
    });
  });

  describe("structuredContent responses", () => {
    it("should normalize IDs in structuredContent", () => {
      // Arrange
      const input = {
        structuredContent: {
          id: TEST_UUID,
          name: "Test Item",
        },
      };

      // Act
      const result = createSnapshotResult(input);

      // Assert
      expect(result.structuredContent.id).toBe(BLANK_UUID);
      expect(result.structuredContent.name).toBe("Test Item");
    });

    it("should normalize specific ID when provided", () => {
      // Arrange
      const specificId = "specific-uuid";
      const input = {
        structuredContent: {
          id: specificId,
          otherId: TEST_UUID,
        },
      };

      // Act
      const result = createSnapshotResult(input, specificId);

      // Assert
      expect(result.structuredContent.id).toBe(BLANK_UUID);
      expect(result.structuredContent.otherId).toBe(TEST_UUID);
    });

    it("should normalize parent references in structuredContent", () => {
      // Arrange
      const input = {
        structuredContent: {
          id: TEST_UUID,
          parent: { id: "parent-uuid", name: "Parent" },
        },
      };

      // Act
      const result = createSnapshotResult(input);

      // Assert
      expect(result.structuredContent.id).toBe(BLANK_UUID);
      expect(result.structuredContent.parent.id).toBe(BLANK_UUID);
      expect(result.structuredContent.parent.name).toBe("Parent");
    });

    it("should normalize dates in structuredContent", () => {
      // Arrange
      const input = {
        structuredContent: {
          id: TEST_UUID,
          createDate: "2025-05-03T20:51:08.36+00:00",
          publishDate: "2025-05-04T10:00:00.00+00:00",
          updateDate: "2025-05-05T12:00:00.00+00:00",
        },
      };

      // Act
      const result = createSnapshotResult(input);

      // Assert
      expect(result.structuredContent.createDate).toBe("NORMALIZED_DATE");
      expect(result.structuredContent.publishDate).toBe("NORMALIZED_DATE");
      expect(result.structuredContent.updateDate).toBe("NORMALIZED_DATE");
    });

    it("should normalize variants array in structuredContent", () => {
      // Arrange
      const input = {
        structuredContent: {
          id: TEST_UUID,
          variants: [
            {
              createDate: "2025-05-03T20:51:08.36+00:00",
              publishDate: "2025-05-04T10:00:00.00+00:00",
              updateDate: "2025-05-05T12:00:00.00+00:00",
            },
            {
              createDate: "2025-06-03T20:51:08.36+00:00",
              publishDate: "2025-06-04T10:00:00.00+00:00",
              updateDate: "2025-06-05T12:00:00.00+00:00",
            },
          ],
        },
      };

      // Act
      const result = createSnapshotResult(input);

      // Assert
      expect(result.structuredContent.variants).toHaveLength(2);
      for (const variant of result.structuredContent.variants) {
        expect(variant.createDate).toBe("NORMALIZED_DATE");
        expect(variant.publishDate).toBe("NORMALIZED_DATE");
        expect(variant.updateDate).toBe("NORMALIZED_DATE");
      }
    });

    it("should normalize items array in structuredContent", () => {
      // Arrange
      const input = {
        structuredContent: {
          items: [
            { id: "id-1", createDate: "2025-05-03T20:51:08.36+00:00" },
            { id: "id-2", createDate: "2025-05-04T20:51:08.36+00:00" },
          ],
          total: 2,
        },
      };

      // Act
      const result = createSnapshotResult(input);

      // Assert
      expect(result.structuredContent.items).toHaveLength(2);
      expect(result.structuredContent.items[0].id).toBe(BLANK_UUID);
      expect(result.structuredContent.items[0].createDate).toBe("NORMALIZED_DATE");
      expect(result.structuredContent.items[1].id).toBe(BLANK_UUID);
      expect(result.structuredContent.items[1].createDate).toBe("NORMALIZED_DATE");
      expect(result.structuredContent.total).toBe(2);
    });
  });
});

describe("normalizeObject", () => {
  it("should handle null values", () => {
    expect(normalizeObject(null)).toBeNull();
  });

  it("should normalize media src paths", () => {
    const input = {
      src: "/media/ykvl3nua/example.jpg",
    };

    const result = normalizeObject(input);

    expect(result.src).toBe("/media/NORMALIZED_PATH/example.jpg");
  });

  it("should normalize values array recursively", () => {
    const input = {
      values: [
        {
          alias: "umbracoFile",
          value: {
            src: "/media/abc123/image.png",
            crops: [],
          },
        },
        {
          alias: "umbracoWidth",
          value: 800,
        },
      ],
    };

    const result = normalizeObject(input);

    expect(result.values[0].value.src).toBe("/media/NORMALIZED_PATH/image.png");
    expect(result.values[1].value).toBe(800);
  });

  it("should normalize nested value objects", () => {
    const input = {
      alias: "mediaFile",
      value: {
        src: "/media/xyz789/photo.jpg",
        focalPoint: { left: 0.5, top: 0.5 },
      },
    };

    const result = normalizeObject(input);

    expect(result.value.src).toBe("/media/NORMALIZED_PATH/photo.jpg");
    expect(result.value.focalPoint).toEqual({ left: 0.5, top: 0.5 });
  });

  it("should handle undefined values", () => {
    expect(normalizeObject(undefined)).toBeUndefined();
  });

  it("should handle primitive values", () => {
    expect(normalizeObject("string")).toBe("string");
    expect(normalizeObject(123)).toBe(123);
    expect(normalizeObject(true)).toBe(true);
  });

  it("should normalize arrays recursively", () => {
    const input = [
      { id: "id-1", name: "Item 1" },
      { id: "id-2", name: "Item 2" },
    ];

    const result = normalizeObject(input);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(BLANK_UUID);
    expect(result[1].id).toBe(BLANK_UUID);
  });

  it("should normalize ancestors array", () => {
    const input = {
      ancestors: [
        { id: "ancestor-1" },
        { id: "ancestor-2" },
      ],
    };

    const result = normalizeObject(input);

    expect(result.ancestors[0].id).toBe(BLANK_UUID);
    expect(result.ancestors[1].id).toBe(BLANK_UUID);
  });

  it("should normalize parent.path with timestamps", () => {
    const input = {
      parent: {
        id: "parent-id",
        path: "/some/path_1234567890123/file.js",
      },
    };

    const result = normalizeObject(input);

    expect(result.parent.id).toBe(BLANK_UUID);
    expect(result.parent.path).toBe("/some/path_NORMALIZED_TIMESTAMP/file.js");
  });

  it("should normalize avatarUrls with hashes", () => {
    const input = {
      avatarUrls: [
        "/avatar/1234567890abcdef1234567890abcdef12345678.jpg",
        "/avatar/abcdef1234567890abcdef1234567890abcdef12.jpg",
      ],
    };

    const result = normalizeObject(input);

    expect(result.avatarUrls[0]).toBe("/avatar/NORMALIZED_AVATAR.jpg");
    expect(result.avatarUrls[1]).toBe("/avatar/NORMALIZED_AVATAR.jpg");
  });

  it("should normalize urlInfos with media paths", () => {
    const input = {
      urlInfos: [
        { culture: "en-US", url: "/media/abc123xyz/image.jpg" },
        { culture: "da-DK", url: "/media/xyz789abc/photo.png" },
      ],
    };

    const result = normalizeObject(input);

    expect(result.urlInfos[0].url).toBe("/media/NORMALIZED_PATH/image.jpg");
    expect(result.urlInfos[0].culture).toBe("en-US");
    expect(result.urlInfos[1].url).toBe("/media/NORMALIZED_PATH/photo.png");
  });

  it("should handle urlInfos with null/undefined url", () => {
    const input = {
      urlInfos: [
        { culture: "en-US", url: null },
        { culture: "da-DK", url: undefined },
      ],
    };

    const result = normalizeObject(input);

    expect(result.urlInfos[0].url).toBeNull();
    expect(result.urlInfos[1].url).toBeUndefined();
  });

  it("should normalize results array with contentKey", () => {
    const input = {
      results: [
        { contentKey: "key-1", data: "some data" },
        { contentKey: "key-2", data: "other data" },
        { data: "no key" },
      ],
    };

    const result = normalizeObject(input);

    expect(result.results[0].contentKey).toBe(BLANK_UUID);
    expect(result.results[0].data).toBe("some data");
    expect(result.results[1].contentKey).toBe(BLANK_UUID);
    expect(result.results[2].contentKey).toBeUndefined();
  });

  it("should normalize availableBlocks with keys", () => {
    const input = {
      availableBlocks: [
        { key: "block-key-1", name: "Block 1" },
        { key: "block-key-2", name: "Block 2" },
      ],
    };

    const result = normalizeObject(input);

    expect(result.availableBlocks[0].key).toBe(BLANK_UUID);
    expect(result.availableBlocks[0].name).toBe("Block 1");
    expect(result.availableBlocks[1].key).toBe(BLANK_UUID);
  });

  it("should normalize nested document field", () => {
    const input = {
      document: {
        id: "doc-id",
        createDate: "2025-01-01T00:00:00.00+00:00",
        name: "Test Document",
      },
    };

    const result = normalizeObject(input);

    expect(result.document.id).toBe(BLANK_UUID);
    expect(result.document.createDate).toBe("NORMALIZED_DATE");
    expect(result.document.name).toBe("Test Document");
  });

  it("should normalize nested structuredContent in objects", () => {
    const input = {
      structuredContent: {
        id: "content-id",
        updateDate: "2025-01-02T00:00:00.00+00:00",
      },
    };

    const result = normalizeObject(input);

    expect(result.structuredContent.id).toBe(BLANK_UUID);
    expect(result.structuredContent.updateDate).toBe("NORMALIZED_DATE");
  });
});

describe("normalizeErrorResponse", () => {
  it("should normalize trace IDs in structuredContent error response", () => {
    // Arrange
    const input: CallToolResult = {
      content: [],
      structuredContent: {
        error: "Something went wrong",
        traceId: "00-1234567890abcdef1234567890abcdef-1234567890abcdef-00",
      },
    };

    // Act
    const result = normalizeErrorResponse(input);

    // Assert
    expect((result.structuredContent as any).traceId).toBe("normalized-trace-id");
  });

  it("should handle response without structuredContent", () => {
    // Arrange
    const input: CallToolResult = {
      content: [],
    };

    // Act
    const result = normalizeErrorResponse(input);

    // Assert
    expect(result).toEqual(input);
  });

  it("should handle structuredContent without traceId", () => {
    // Arrange
    const input: CallToolResult = {
      content: [],
      structuredContent: {
        error: "Error without trace ID",
      },
    };

    // Act
    const result = normalizeErrorResponse(input);

    // Assert
    expect(result).toEqual(input);
  });
});
