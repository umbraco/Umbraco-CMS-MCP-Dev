import {
  isRichTextValue,
  isBlockStructure,
  discoverAllBlockArrays,
  findBlockByKey,
  type BlockDataItem,
  type DiscoveredBlockArrays
} from "../block-discovery.js";

describe("block-discovery helpers", () => {
  describe("isRichTextValue", () => {
    it("should return true for valid RichText structure", () => {
      const richTextValue = {
        markup: "<p>Hello</p>",
        blocks: {
          layout: {},
          contentData: [],
          settingsData: [],
          expose: []
        }
      };
      expect(isRichTextValue(richTextValue)).toBe(true);
    });

    it("should return true for RichText with content in blocks", () => {
      const richTextValue = {
        markup: "<p>Hello</p>",
        blocks: {
          layout: { "Umbraco.BlockList": [{ contentKey: "abc" }] },
          contentData: [{ key: "abc", contentTypeKey: "type-1", values: [] }],
          settingsData: [],
          expose: []
        }
      };
      expect(isRichTextValue(richTextValue)).toBe(true);
    });

    it("should return false for null", () => {
      expect(isRichTextValue(null)).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(isRichTextValue(undefined)).toBe(false);
    });

    it("should return false for primitive values", () => {
      expect(isRichTextValue("string")).toBe(false);
      expect(isRichTextValue(123)).toBe(false);
      expect(isRichTextValue(true)).toBe(false);
    });

    it("should return false for empty object", () => {
      expect(isRichTextValue({})).toBe(false);
    });

    it("should return false for object without markup", () => {
      const value = {
        blocks: {
          contentData: [],
          settingsData: []
        }
      };
      expect(isRichTextValue(value)).toBe(false);
    });

    it("should return false for object without blocks", () => {
      const value = {
        markup: "<p>Hello</p>"
      };
      expect(isRichTextValue(value)).toBe(false);
    });

    it("should return false for object with blocks but no contentData", () => {
      const value = {
        markup: "<p>Hello</p>",
        blocks: {
          settingsData: []
        }
      };
      expect(isRichTextValue(value)).toBe(false);
    });

    it("should return false for object with blocks but no settingsData", () => {
      const value = {
        markup: "<p>Hello</p>",
        blocks: {
          contentData: []
        }
      };
      expect(isRichTextValue(value)).toBe(false);
    });

    it("should return false for BlockList structure (no markup)", () => {
      const blockListValue = {
        layout: { "Umbraco.BlockList": [] },
        contentData: [],
        settingsData: []
      };
      expect(isRichTextValue(blockListValue)).toBe(false);
    });
  });

  describe("isBlockStructure", () => {
    it("should return true for empty BlockList structure", () => {
      const value = {
        contentData: [],
        settingsData: []
      };
      expect(isBlockStructure(value)).toBe(true);
    });

    it("should return true for BlockList with content", () => {
      const value = {
        layout: { "Umbraco.BlockList": [] },
        contentData: [{ key: "abc", contentTypeKey: "type-1", values: [] }],
        settingsData: []
      };
      expect(isBlockStructure(value)).toBe(true);
    });

    it("should return true for BlockGrid structure", () => {
      const value = {
        layout: { "Umbraco.BlockGrid": [] },
        contentData: [],
        settingsData: []
      };
      expect(isBlockStructure(value)).toBe(true);
    });

    it("should return false for null", () => {
      expect(isBlockStructure(null)).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(isBlockStructure(undefined)).toBe(false);
    });

    it("should return false for primitive values", () => {
      expect(isBlockStructure("string")).toBe(false);
      expect(isBlockStructure(123)).toBe(false);
      expect(isBlockStructure(true)).toBe(false);
    });

    it("should return false for object without contentData", () => {
      const value = {
        settingsData: []
      };
      expect(isBlockStructure(value)).toBe(false);
    });

    it("should return false for object without settingsData", () => {
      const value = {
        contentData: []
      };
      expect(isBlockStructure(value)).toBe(false);
    });

    it("should return false for object with non-array contentData", () => {
      const value = {
        contentData: {},
        settingsData: []
      };
      expect(isBlockStructure(value)).toBe(false);
    });

    it("should return false for object with non-array settingsData", () => {
      const value = {
        contentData: [],
        settingsData: "not an array"
      };
      expect(isBlockStructure(value)).toBe(false);
    });
  });

  describe("discoverAllBlockArrays", () => {
    describe("base cases", () => {
      it("should return empty array for null", () => {
        expect(discoverAllBlockArrays(null)).toEqual([]);
      });

      it("should return empty array for undefined", () => {
        expect(discoverAllBlockArrays(undefined)).toEqual([]);
      });

      it("should return empty array for primitive values", () => {
        expect(discoverAllBlockArrays("string")).toEqual([]);
        expect(discoverAllBlockArrays(123)).toEqual([]);
        expect(discoverAllBlockArrays(true)).toEqual([]);
      });

      it("should return empty array for empty object", () => {
        expect(discoverAllBlockArrays({})).toEqual([]);
      });

      it("should return empty array for object without block structure", () => {
        expect(discoverAllBlockArrays({ foo: "bar" })).toEqual([]);
      });
    });

    describe("simple BlockList/BlockGrid", () => {
      it("should discover empty BlockList", () => {
        const value = {
          layout: { "Umbraco.BlockList": [] },
          contentData: [],
          settingsData: []
        };
        const result = discoverAllBlockArrays(value);
        expect(result).toHaveLength(1);
        expect(result[0].contentData).toEqual([]);
        expect(result[0].settingsData).toEqual([]);
        expect(result[0].path).toBe("root");
      });

      it("should discover BlockList with content", () => {
        const block: BlockDataItem = {
          key: "block-1",
          contentTypeKey: "type-1",
          values: [{ alias: "title", value: "Hello" }]
        };
        const value = {
          layout: { "Umbraco.BlockList": [{ contentKey: "block-1" }] },
          contentData: [block],
          settingsData: []
        };
        const result = discoverAllBlockArrays(value);
        expect(result).toHaveLength(1);
        expect(result[0].contentData).toHaveLength(1);
        expect(result[0].contentData[0].key).toBe("block-1");
      });

      it("should use custom path when provided", () => {
        const value = {
          contentData: [],
          settingsData: []
        };
        const result = discoverAllBlockArrays(value, "property(mainContent)");
        expect(result[0].path).toBe("property(mainContent)");
      });
    });

    describe("RichText structure", () => {
      it("should discover blocks inside RichText", () => {
        const richTextValue = {
          markup: "<p>Hello</p>",
          blocks: {
            layout: {},
            contentData: [{ key: "rte-block-1", contentTypeKey: "type-1", values: [] }],
            settingsData: []
          }
        };
        const result = discoverAllBlockArrays(richTextValue, "property(rte)");
        expect(result).toHaveLength(1);
        expect(result[0].path).toBe("property(rte).blocks");
        expect(result[0].contentData).toHaveLength(1);
        expect(result[0].contentData[0].key).toBe("rte-block-1");
      });

      it("should not discover RichText itself, only its blocks", () => {
        const richTextValue = {
          markup: "<p>Hello</p>",
          blocks: {
            layout: {},
            contentData: [],
            settingsData: []
          }
        };
        const result = discoverAllBlockArrays(richTextValue);
        // Should find the blocks inside, not the RichText wrapper
        expect(result).toHaveLength(1);
        expect(result[0].path).toBe("root.blocks");
      });
    });

    describe("nested structures in contentData", () => {
      it("should discover nested BlockList inside a block property", () => {
        const nestedBlockList = {
          layout: { "Umbraco.BlockList": [] },
          contentData: [{ key: "nested-block-1", contentTypeKey: "nested-type", values: [] }],
          settingsData: []
        };
        const parentBlock: BlockDataItem = {
          key: "parent-block",
          contentTypeKey: "parent-type",
          values: [{ alias: "nestedContent", value: nestedBlockList }]
        };
        const value = {
          layout: { "Umbraco.BlockList": [] },
          contentData: [parentBlock],
          settingsData: []
        };

        const result = discoverAllBlockArrays(value, "root");
        expect(result).toHaveLength(2);
        expect(result[0].path).toBe("root");
        expect(result[1].path).toBe("root.contentData[0].values[0](nestedContent)");
        expect(result[1].contentData[0].key).toBe("nested-block-1");
      });

      it("should discover nested RichText inside a block property", () => {
        const nestedRte = {
          markup: "<p>Nested RTE</p>",
          blocks: {
            layout: {},
            contentData: [{ key: "nested-rte-block", contentTypeKey: "rte-type", values: [] }],
            settingsData: []
          }
        };
        const parentBlock: BlockDataItem = {
          key: "parent-block",
          contentTypeKey: "parent-type",
          values: [{ alias: "richText", value: nestedRte }]
        };
        const value = {
          contentData: [parentBlock],
          settingsData: []
        };

        const result = discoverAllBlockArrays(value, "root");
        expect(result).toHaveLength(2);
        expect(result[0].path).toBe("root");
        expect(result[1].path).toBe("root.contentData[0].values[0](richText).blocks");
        expect(result[1].contentData[0].key).toBe("nested-rte-block");
      });
    });

    describe("nested structures in settingsData", () => {
      it("should discover nested BlockList inside a settings block property", () => {
        const nestedBlockList = {
          contentData: [{ key: "nested-settings-block", contentTypeKey: "nested-type", values: [] }],
          settingsData: []
        };
        const settingsBlock: BlockDataItem = {
          key: "settings-block",
          contentTypeKey: "settings-type",
          values: [{ alias: "nestedBlocks", value: nestedBlockList }]
        };
        const value = {
          contentData: [],
          settingsData: [settingsBlock]
        };

        const result = discoverAllBlockArrays(value, "root");
        expect(result).toHaveLength(2);
        expect(result[0].path).toBe("root");
        expect(result[1].path).toBe("root.settingsData[0].values[0](nestedBlocks)");
      });

      it("should discover nested RichText inside a settings block property", () => {
        const nestedRte = {
          markup: "<p>Settings RTE</p>",
          blocks: {
            layout: {},
            contentData: [{ key: "settings-rte-block", contentTypeKey: "rte-type", values: [] }],
            settingsData: []
          }
        };
        const settingsBlock: BlockDataItem = {
          key: "settings-block",
          contentTypeKey: "settings-type",
          values: [{ alias: "settingsRte", value: nestedRte }]
        };
        const value = {
          contentData: [],
          settingsData: [settingsBlock]
        };

        const result = discoverAllBlockArrays(value, "root");
        expect(result).toHaveLength(2);
        expect(result[1].path).toBe("root.settingsData[0].values[0](settingsRte).blocks");
      });
    });

    describe("deeply nested structures", () => {
      it("should discover blocks at multiple nesting levels", () => {
        // Level 3: deepest nested block list
        const level3BlockList = {
          contentData: [{ key: "level-3-block", contentTypeKey: "type-3", values: [] }],
          settingsData: []
        };

        // Level 2: contains level 3
        const level2Block: BlockDataItem = {
          key: "level-2-block",
          contentTypeKey: "type-2",
          values: [{ alias: "deeperContent", value: level3BlockList }]
        };
        const level2BlockList = {
          contentData: [level2Block],
          settingsData: []
        };

        // Level 1: contains level 2
        const level1Block: BlockDataItem = {
          key: "level-1-block",
          contentTypeKey: "type-1",
          values: [{ alias: "nestedContent", value: level2BlockList }]
        };
        const topLevel = {
          contentData: [level1Block],
          settingsData: []
        };

        const result = discoverAllBlockArrays(topLevel, "root");
        expect(result).toHaveLength(3);
        expect(result[0].contentData[0].key).toBe("level-1-block");
        expect(result[1].contentData[0].key).toBe("level-2-block");
        expect(result[2].contentData[0].key).toBe("level-3-block");
      });
    });

    describe("edge cases", () => {
      it("should handle blocks with no values array", () => {
        const block = {
          key: "block-1",
          contentTypeKey: "type-1"
          // no values property
        } as unknown as BlockDataItem;
        const value = {
          contentData: [block],
          settingsData: []
        };
        // Should not throw
        expect(() => discoverAllBlockArrays(value)).not.toThrow();
        expect(discoverAllBlockArrays(value)).toHaveLength(1);
      });

      it("should handle blocks with empty values array", () => {
        const block: BlockDataItem = {
          key: "block-1",
          contentTypeKey: "type-1",
          values: []
        };
        const value = {
          contentData: [block],
          settingsData: []
        };
        const result = discoverAllBlockArrays(value);
        expect(result).toHaveLength(1);
      });

      it("should handle values with null value property", () => {
        const block: BlockDataItem = {
          key: "block-1",
          contentTypeKey: "type-1",
          values: [{ alias: "nullProp", value: null }]
        };
        const value = {
          contentData: [block],
          settingsData: []
        };
        const result = discoverAllBlockArrays(value);
        expect(result).toHaveLength(1);
      });

      it("should handle multiple blocks at same level", () => {
        const value = {
          contentData: [
            { key: "block-1", contentTypeKey: "type-1", values: [] },
            { key: "block-2", contentTypeKey: "type-2", values: [] },
            { key: "block-3", contentTypeKey: "type-3", values: [] }
          ],
          settingsData: [
            { key: "settings-1", contentTypeKey: "settings-type", values: [] }
          ]
        };
        const result = discoverAllBlockArrays(value);
        expect(result).toHaveLength(1);
        expect(result[0].contentData).toHaveLength(3);
        expect(result[0].settingsData).toHaveLength(1);
      });
    });
  });

  describe("findBlockByKey", () => {
    const createDiscoveredArrays = (): DiscoveredBlockArrays[] => [
      {
        path: "root",
        contentData: [
          { key: "content-1", contentTypeKey: "type-1", values: [] },
          { key: "content-2", contentTypeKey: "type-2", values: [] }
        ],
        settingsData: [
          { key: "settings-1", contentTypeKey: "settings-type", values: [] }
        ]
      },
      {
        path: "root.contentData[0].values[0](nested)",
        contentData: [
          { key: "nested-content-1", contentTypeKey: "nested-type", values: [] }
        ],
        settingsData: []
      }
    ];

    describe("finding content blocks", () => {
      it("should find content block by key", () => {
        const arrays = createDiscoveredArrays();
        const result = findBlockByKey(arrays, "content-1", "content");
        expect(result).not.toBeNull();
        expect(result!.block.key).toBe("content-1");
        expect(result!.path).toBe("root");
      });

      it("should find second content block", () => {
        const arrays = createDiscoveredArrays();
        const result = findBlockByKey(arrays, "content-2", "content");
        expect(result).not.toBeNull();
        expect(result!.block.key).toBe("content-2");
      });

      it("should find nested content block", () => {
        const arrays = createDiscoveredArrays();
        const result = findBlockByKey(arrays, "nested-content-1", "content");
        expect(result).not.toBeNull();
        expect(result!.block.key).toBe("nested-content-1");
        expect(result!.path).toBe("root.contentData[0].values[0](nested)");
      });

      it("should return null for non-existent content key", () => {
        const arrays = createDiscoveredArrays();
        const result = findBlockByKey(arrays, "non-existent", "content");
        expect(result).toBeNull();
      });

      it("should not find settings block when searching content", () => {
        const arrays = createDiscoveredArrays();
        const result = findBlockByKey(arrays, "settings-1", "content");
        expect(result).toBeNull();
      });
    });

    describe("finding settings blocks", () => {
      it("should find settings block by key", () => {
        const arrays = createDiscoveredArrays();
        const result = findBlockByKey(arrays, "settings-1", "settings");
        expect(result).not.toBeNull();
        expect(result!.block.key).toBe("settings-1");
        expect(result!.path).toBe("root");
      });

      it("should return null for non-existent settings key", () => {
        const arrays = createDiscoveredArrays();
        const result = findBlockByKey(arrays, "non-existent", "settings");
        expect(result).toBeNull();
      });

      it("should not find content block when searching settings", () => {
        const arrays = createDiscoveredArrays();
        const result = findBlockByKey(arrays, "content-1", "settings");
        expect(result).toBeNull();
      });
    });

    describe("array reference", () => {
      it("should return reference to correct content array", () => {
        const arrays = createDiscoveredArrays();
        const result = findBlockByKey(arrays, "content-1", "content");
        expect(result).not.toBeNull();
        expect(result!.arrayRef).toBe(arrays[0].contentData);
      });

      it("should return reference to correct settings array", () => {
        const arrays = createDiscoveredArrays();
        const result = findBlockByKey(arrays, "settings-1", "settings");
        expect(result).not.toBeNull();
        expect(result!.arrayRef).toBe(arrays[0].settingsData);
      });

      it("should return reference to nested array", () => {
        const arrays = createDiscoveredArrays();
        const result = findBlockByKey(arrays, "nested-content-1", "content");
        expect(result).not.toBeNull();
        expect(result!.arrayRef).toBe(arrays[1].contentData);
      });
    });

    describe("edge cases", () => {
      it("should handle empty discovered arrays", () => {
        const result = findBlockByKey([], "any-key", "content");
        expect(result).toBeNull();
      });

      it("should handle arrays with empty contentData and settingsData", () => {
        const arrays: DiscoveredBlockArrays[] = [{
          path: "root",
          contentData: [],
          settingsData: []
        }];
        const result = findBlockByKey(arrays, "any-key", "content");
        expect(result).toBeNull();
      });

      it("should find first match when duplicate keys exist (edge case)", () => {
        const arrays: DiscoveredBlockArrays[] = [
          {
            path: "first",
            contentData: [{ key: "duplicate", contentTypeKey: "type-1", values: [] }],
            settingsData: []
          },
          {
            path: "second",
            contentData: [{ key: "duplicate", contentTypeKey: "type-2", values: [] }],
            settingsData: []
          }
        ];
        const result = findBlockByKey(arrays, "duplicate", "content");
        expect(result).not.toBeNull();
        expect(result!.path).toBe("first");
        expect(result!.block.contentTypeKey).toBe("type-1");
      });
    });
  });
});
