import {
  createSnapshotResult,
  normalizeErrorResponse,
  normalizeObject,
} from "@/test-helpers/create-snapshot-result.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

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
});

describe("normalizeErrorResponse", () => {
  it("should normalize trace IDs in structuredContent error response", () => {
    // Arrange
    const input: CallToolResult = {
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
