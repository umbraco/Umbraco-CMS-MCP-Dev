/**
 * Normalization Golden File Tests
 *
 * These tests capture the exact output of the normalization functions.
 * They serve as regression tests to ensure refactoring doesn't change behavior.
 *
 * IMPORTANT: These snapshots were created with the ORIGINAL implementation.
 * After refactoring, if these tests fail, the refactored code has different behavior.
 */

import { createSnapshotResult, normalizeErrorResponse } from "@/test-helpers/create-snapshot-result.js";
import { BLANK_UUID } from "@/constants/constants.js";

describe("Normalization Golden Files - structuredContent format", () => {
  describe("ID normalization", () => {
    it("should normalize basic id field", () => {
      const input = {
        structuredContent: {
          id: "12345678-1234-1234-1234-123456789012",
          name: "Test Item",
        },
      };
      expect(createSnapshotResult(input)).toMatchSnapshot();
    });

    it("should normalize id with specific idToReplace", () => {
      const specificId = "abcdef12-abcd-abcd-abcd-abcdef123456";
      const input = {
        structuredContent: {
          id: specificId,
          otherId: "99999999-9999-9999-9999-999999999999",
          name: "Test Item",
        },
      };
      expect(createSnapshotResult(input, specificId)).toMatchSnapshot();
    });

    it("should normalize parent.id", () => {
      const input = {
        structuredContent: {
          id: "child-id-1234-1234-123456789012",
          name: "Child",
          parent: {
            id: "parent-id-1234-1234-123456789012",
            name: "Parent",
          },
        },
      };
      expect(createSnapshotResult(input)).toMatchSnapshot();
    });

    it("should normalize document.id", () => {
      const input = {
        structuredContent: {
          id: "version-id-1234-1234-123456789012",
          document: {
            id: "document-id-1234-1234-123456789012",
            name: "My Document",
          },
        },
      };
      expect(createSnapshotResult(input)).toMatchSnapshot();
    });

    it("should normalize documentType.id", () => {
      const input = {
        structuredContent: {
          id: "item-id-1234-1234-123456789012",
          documentType: {
            id: "doctype-id-1234-1234-123456789012",
            alias: "myDocType",
          },
        },
      };
      expect(createSnapshotResult(input)).toMatchSnapshot();
    });

    it("should normalize mediaType.id", () => {
      const input = {
        structuredContent: {
          id: "media-item-1234-1234-123456789012",
          mediaType: {
            id: "mediatype-id-1234-1234-123456789012",
            alias: "Image",
          },
        },
      };
      expect(createSnapshotResult(input)).toMatchSnapshot();
    });

    it("should normalize user.id", () => {
      const input = {
        structuredContent: {
          id: "item-id-1234-1234-123456789012",
          user: {
            id: "user-id-1234-1234-123456789012",
            name: "Admin User",
          },
        },
      };
      expect(createSnapshotResult(input)).toMatchSnapshot();
    });

    it("should normalize ancestors array ids", () => {
      const input = {
        structuredContent: {
          id: "item-id-1234-1234-123456789012",
          ancestors: [
            { id: "ancestor1-1234-1234-123456789012", name: "Root" },
            { id: "ancestor2-1234-1234-123456789012", name: "Middle" },
            { id: "ancestor3-1234-1234-123456789012", name: "Parent" },
          ],
        },
      };
      expect(createSnapshotResult(input)).toMatchSnapshot();
    });
  });

  describe("Date normalization", () => {
    it("should normalize all date fields", () => {
      const input = {
        structuredContent: {
          id: "item-id-1234-1234-123456789012",
          createDate: "2025-01-15T10:30:00.000Z",
          publishDate: "2025-01-16T11:00:00.000Z",
          updateDate: "2025-01-17T12:30:00.000Z",
          versionDate: "2025-01-18T13:45:00.000Z",
          lastLoginDate: "2025-01-19T14:00:00.000Z",
          lastPasswordChangeDate: "2025-01-20T15:15:00.000Z",
          lastLockoutDate: "2025-01-21T16:30:00.000Z",
        },
      };
      expect(createSnapshotResult(input)).toMatchSnapshot();
    });

    it("should normalize dates in variants array", () => {
      const input = {
        structuredContent: {
          id: "doc-id-1234-1234-123456789012",
          variants: [
            {
              culture: "en-US",
              createDate: "2025-01-15T10:30:00.000Z",
              publishDate: "2025-01-16T11:00:00.000Z",
              updateDate: "2025-01-17T12:30:00.000Z",
              versionDate: "2025-01-18T13:45:00.000Z",
            },
            {
              culture: "da-DK",
              createDate: "2025-02-15T10:30:00.000Z",
              publishDate: "2025-02-16T11:00:00.000Z",
              updateDate: "2025-02-17T12:30:00.000Z",
              versionDate: "2025-02-18T13:45:00.000Z",
            },
          ],
        },
      };
      expect(createSnapshotResult(input)).toMatchSnapshot();
    });
  });

  describe("Regex normalizations", () => {
    it("should normalize name with timestamp", () => {
      const input = {
        structuredContent: {
          id: "item-id-1234-1234-123456789012",
          name: "Test_1704067200000_Item",
        },
      };
      expect(createSnapshotResult(input)).toMatchSnapshot();
    });

    it("should normalize path with timestamp", () => {
      const input = {
        structuredContent: {
          id: "item-id-1234-1234-123456789012",
          path: "/root/folder_1704067200000/subfolder_1704067200001/file.js",
        },
      };
      expect(createSnapshotResult(input)).toMatchSnapshot();
    });

    it("should normalize parent.path with timestamp", () => {
      const input = {
        structuredContent: {
          id: "item-id-1234-1234-123456789012",
          parent: {
            id: "parent-id-1234-1234-123456789012",
            path: "/root/folder_1704067200000/parent",
          },
        },
      };
      expect(createSnapshotResult(input)).toMatchSnapshot();
    });

    it("should normalize email with random numbers", () => {
      const input = {
        structuredContent: {
          id: "user-id-1234-1234-123456789012",
          email: "test-12345@example.com",
        },
      };
      expect(createSnapshotResult(input)).toMatchSnapshot();
    });

    it("should normalize userName with random numbers", () => {
      const input = {
        structuredContent: {
          id: "user-id-1234-1234-123456789012",
          userName: "testuser-67890@domain.com",
        },
      };
      expect(createSnapshotResult(input)).toMatchSnapshot();
    });

    it("should normalize avatarUrls with hash", () => {
      const input = {
        structuredContent: {
          id: "user-id-1234-1234-123456789012",
          avatarUrls: [
            "/umbraco/assets/avatars/0123456789abcdef0123456789abcdef01234567.jpg",
            "/umbraco/assets/avatars/fedcba9876543210fedcba9876543210fedcba98.jpg",
          ],
        },
      };
      expect(createSnapshotResult(input)).toMatchSnapshot();
    });

    it("should normalize urlInfos with media path", () => {
      const input = {
        structuredContent: {
          id: "media-id-1234-1234-123456789012",
          urlInfos: [
            { culture: "en-US", url: "/media/abc123/image.jpg" },
            { culture: "da-DK", url: "/media/xyz789/image.jpg" },
          ],
        },
      };
      expect(createSnapshotResult(input)).toMatchSnapshot();
    });
  });

  describe("Nested items array", () => {
    it("should normalize items in nested items array", () => {
      const input = {
        structuredContent: {
          items: [
            {
              id: "item1-1234-1234-123456789012",
              name: "Item 1",
              createDate: "2025-01-15T10:30:00.000Z",
              parent: { id: "parent-1234-1234-123456789012" },
            },
            {
              id: "item2-1234-1234-123456789012",
              name: "Item 2",
              createDate: "2025-01-16T11:00:00.000Z",
              parent: null,
            },
          ],
          total: 2,
        },
      };
      expect(createSnapshotResult(input)).toMatchSnapshot();
    });
  });

  describe("Complex nested structures", () => {
    it("should normalize deeply nested document with all fields", () => {
      const input = {
        structuredContent: {
          id: "doc-version-1234-1234-123456789012",
          createDate: "2025-01-15T10:30:00.000Z",
          document: {
            id: "doc-id-1234-1234-123456789012",
            documentType: {
              id: "doctype-1234-1234-123456789012",
              alias: "blogPost",
            },
          },
          user: {
            id: "user-id-1234-1234-123456789012",
            name: "Editor",
          },
          parent: {
            id: "parent-1234-1234-123456789012",
            path: "/root/blog_1704067200000",
          },
          variants: [
            {
              culture: "en-US",
              createDate: "2025-01-15T10:30:00.000Z",
              publishDate: "2025-01-16T11:00:00.000Z",
            },
          ],
          ancestors: [
            { id: "root-1234-1234-123456789012", name: "Root" },
          ],
        },
      };
      expect(createSnapshotResult(input)).toMatchSnapshot();
    });
  });
});

describe("Normalization Golden Files - legacy content[0].text format", () => {
  describe("Void operations", () => {
    it("should return void result unchanged", () => {
      const input = {
        content: [{ type: "text", text: "" }],
      };
      expect(createSnapshotResult(input)).toMatchSnapshot();
    });
  });

  describe("Array responses (ancestors)", () => {
    it("should normalize array response", () => {
      const input = {
        content: [
          {
            type: "text",
            text: JSON.stringify([
              {
                id: "ancestor1-1234-1234-123456789012",
                name: "Root",
                createDate: "2025-01-15T10:30:00.000Z",
                parent: null,
              },
              {
                id: "ancestor2-1234-1234-123456789012",
                name: "Child",
                createDate: "2025-01-16T11:00:00.000Z",
                parent: { id: "parent-1234-1234-123456789012" },
              },
            ]),
          },
        ],
      };
      expect(createSnapshotResult(input)).toMatchSnapshot();
    });
  });

  describe("Items array in object", () => {
    it("should normalize items array with all fields", () => {
      const input = {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              items: [
                {
                  id: "item1-1234-1234-123456789012",
                  name: "Test_1704067200000_Item",
                  createDate: "2025-01-15T10:30:00.000Z",
                  publishDate: "2025-01-16T11:00:00.000Z",
                  updateDate: "2025-01-17T12:30:00.000Z",
                  parent: {
                    id: "parent-1234-1234-123456789012",
                    path: "/root/folder_1704067200000",
                  },
                  documentType: { id: "doctype-1234-1234-123456789012" },
                  email: "user-12345@example.com",
                  userName: "admin-67890@domain.com",
                  avatarUrls: ["/umbraco/assets/avatars/0123456789abcdef0123456789abcdef01234567.jpg"],
                },
              ],
              total: 1,
            }),
          },
        ],
      };
      expect(createSnapshotResult(input)).toMatchSnapshot();
    });
  });

  describe("Single item with idToReplace", () => {
    it("should normalize single item with all date fields", () => {
      const itemId = "specific-id-1234-1234-123456789012";
      const input = {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              id: itemId,
              createDate: "2025-01-15T10:30:00.000Z",
              availableUntil: "2025-12-31T23:59:59.000Z",
              publishDate: "2025-01-16T11:00:00.000Z",
              updateDate: "2025-01-17T12:30:00.000Z",
              versionDate: "2025-01-18T13:45:00.000Z",
              lastLoginDate: "2025-01-19T14:00:00.000Z",
              lastPasswordChangeDate: "2025-01-20T15:15:00.000Z",
              lastLockoutDate: "2025-01-21T16:30:00.000Z",
            }),
          },
        ],
      };
      expect(createSnapshotResult(input, itemId)).toMatchSnapshot();
    });

    it("should normalize document with nested documentType and variants", () => {
      const itemId = "version-id-1234-1234-123456789012";
      const input = {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              id: itemId,
              document: {
                id: "doc-id-1234-1234-123456789012",
                documentType: {
                  id: "doctype-1234-1234-123456789012",
                  alias: "blogPost",
                },
                variants: [
                  {
                    culture: "en-US",
                    createDate: "2025-01-15T10:30:00.000Z",
                    publishDate: "2025-01-16T11:00:00.000Z",
                    updateDate: "2025-01-17T12:30:00.000Z",
                    versionDate: "2025-01-18T13:45:00.000Z",
                  },
                ],
              },
              documentType: { id: "top-doctype-1234-1234-123456789012" },
              user: { id: "user-1234-1234-123456789012" },
            }),
          },
        ],
      };
      expect(createSnapshotResult(input, itemId)).toMatchSnapshot();
    });

    it("should normalize block results and availableBlocks", () => {
      const itemId = "block-result-1234-1234-123456789012";
      const input = {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              id: itemId,
              results: [
                { contentKey: "block1-1234-1234-123456789012", success: true },
                { contentKey: "block2-1234-1234-123456789012", success: true },
              ],
              availableBlocks: [
                { key: "available1-1234-1234-123456789012", label: "Block 1" },
                { key: "available2-1234-1234-123456789012", label: "Block 2" },
              ],
            }),
          },
        ],
      };
      expect(createSnapshotResult(input, itemId)).toMatchSnapshot();
    });

    it("should normalize email, userName, avatarUrls, urlInfos", () => {
      const itemId = "user-profile-1234-1234-123456789012";
      const input = {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              id: itemId,
              email: "testuser-12345@example.com",
              userName: "admin-67890@domain.com",
              avatarUrls: [
                "/umbraco/assets/avatars/0123456789abcdef0123456789abcdef01234567.jpg",
                "/umbraco/assets/avatars/fedcba9876543210fedcba9876543210fedcba98.jpg",
              ],
              urlInfos: [
                { culture: "en-US", url: "/media/abc123/profile.jpg" },
                { culture: "da-DK", url: "/media/xyz789/profile.jpg" },
              ],
            }),
          },
        ],
      };
      expect(createSnapshotResult(input, itemId)).toMatchSnapshot();
    });

    it("should normalize variants array with all date fields", () => {
      const itemId = "doc-with-variants-1234-1234-123456789012";
      const input = {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              id: itemId,
              variants: [
                {
                  culture: "en-US",
                  createDate: "2025-01-15T10:30:00.000Z",
                  publishDate: "2025-01-16T11:00:00.000Z",
                  updateDate: "2025-01-17T12:30:00.000Z",
                  versionDate: "2025-01-18T13:45:00.000Z",
                },
                {
                  culture: "da-DK",
                  createDate: "2025-02-15T10:30:00.000Z",
                  publishDate: "2025-02-16T11:00:00.000Z",
                  updateDate: "2025-02-17T12:30:00.000Z",
                  versionDate: "2025-02-18T13:45:00.000Z",
                },
              ],
            }),
          },
        ],
      };
      expect(createSnapshotResult(input, itemId)).toMatchSnapshot();
    });
  });

  describe("Top-level variants in object (no idToReplace)", () => {
    it("should normalize variants at object level", () => {
      const input = {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              variants: [
                {
                  culture: "en-US",
                  createDate: "2025-01-15T10:30:00.000Z",
                  publishDate: "2025-01-16T11:00:00.000Z",
                  updateDate: "2025-01-17T12:30:00.000Z",
                },
              ],
              otherField: "value",
            }),
          },
        ],
      };
      expect(createSnapshotResult(input)).toMatchSnapshot();
    });
  });
});

describe("Normalization Golden Files - Error response", () => {
  describe("structuredContent format", () => {
    it("should normalize traceId in structuredContent", () => {
      const input = {
        structuredContent: {
          type: "error",
          title: "Bad Request",
          status: 400,
          traceId: "00-1234567890abcdef1234567890abcdef-1234567890abcdef-00",
        },
        isError: true,
      };
      expect(normalizeErrorResponse(input as any)).toMatchSnapshot();
    });
  });

  describe("Legacy text format", () => {
    it("should normalize traceId in text content", () => {
      const input = {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              type: "error",
              title: "Not Found",
              status: 404,
              traceId: "00-fedcba9876543210fedcba9876543210-fedcba987654321-00",
            }),
          },
        ],
        isError: true,
      };
      expect(normalizeErrorResponse(input as any)).toMatchSnapshot();
    });

    it("should normalize multiple traceIds in text", () => {
      const input = {
        content: [
          {
            type: "text",
            text: "Error: 00-1111111111111111111111111111111-1111111111111111-00, Related: 00-2222222222222222222222222222222-2222222222222222-00",
          },
        ],
      };
      expect(normalizeErrorResponse(input as any)).toMatchSnapshot();
    });
  });

  describe("No traceId present", () => {
    it("should leave content unchanged when no traceId", () => {
      const input = {
        content: [
          {
            type: "text",
            text: "Simple error message without trace ID",
          },
        ],
      };
      expect(normalizeErrorResponse(input as any)).toMatchSnapshot();
    });
  });
});

describe("Normalization Golden Files - Edge cases", () => {
  it("should handle null and undefined values", () => {
    const input = {
      structuredContent: {
        id: "item-1234-1234-123456789012",
        parent: null,
        document: undefined,
        name: null,
      },
    };
    expect(createSnapshotResult(input)).toMatchSnapshot();
  });

  it("should handle empty arrays", () => {
    const input = {
      structuredContent: {
        id: "item-1234-1234-123456789012",
        variants: [],
        ancestors: [],
        items: [],
        avatarUrls: [],
        urlInfos: [],
      },
    };
    expect(createSnapshotResult(input)).toMatchSnapshot();
  });

  it("should handle primitive structuredContent", () => {
    const input = {
      structuredContent: "just a string",
    };
    expect(createSnapshotResult(input)).toMatchSnapshot();
  });

  it("should handle array structuredContent", () => {
    const input = {
      structuredContent: [
        { id: "item1-1234-1234-123456789012", name: "Item 1" },
        { id: "item2-1234-1234-123456789012", name: "Item 2" },
      ],
    };
    expect(createSnapshotResult(input)).toMatchSnapshot();
  });

  it("should preserve non-normalized fields", () => {
    const input = {
      structuredContent: {
        id: "item-1234-1234-123456789012",
        customField: "should be preserved",
        nestedObject: {
          foo: "bar",
          baz: 123,
        },
        arrayOfStrings: ["a", "b", "c"],
      },
    };
    expect(createSnapshotResult(input)).toMatchSnapshot();
  });

  it("should handle deeply nested items recursively", () => {
    const input = {
      structuredContent: {
        items: [
          {
            id: "outer-1234-1234-123456789012",
            items: [
              {
                id: "inner-1234-1234-123456789012",
                createDate: "2025-01-15T10:30:00.000Z",
              },
            ],
          },
        ],
      },
    };
    expect(createSnapshotResult(input)).toMatchSnapshot();
  });
});
