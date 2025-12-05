import { discoverAllBlockArrays } from "../put/update-block-property.js";

describe("discoverAllBlockArrays", () => {
  it("should return empty array for null value", () => {
    const result = discoverAllBlockArrays(null);
    expect(result).toEqual([]);
  });

  it("should return empty array for undefined value", () => {
    const result = discoverAllBlockArrays(undefined);
    expect(result).toEqual([]);
  });

  it("should return empty array for non-object value", () => {
    const result = discoverAllBlockArrays("string value");
    expect(result).toEqual([]);

    const numberResult = discoverAllBlockArrays(123);
    expect(numberResult).toEqual([]);
  });

  it("should return empty array for object without block structure", () => {
    const result = discoverAllBlockArrays({ foo: "bar", baz: 123 });
    expect(result).toEqual([]);
  });

  it("should discover simple BlockList structure", () => {
    const blockListValue = {
      layout: { "Umbraco.BlockList": [] },
      contentData: [
        {
          key: "block-key-1",
          contentTypeKey: "content-type-1",
          values: []
        }
      ],
      settingsData: []
    };

    const result = discoverAllBlockArrays(blockListValue);

    expect(result).toHaveLength(1);
    expect(result[0].contentData).toHaveLength(1);
    expect(result[0].settingsData).toHaveLength(0);
    expect(result[0].path).toBe("root");
  });

  it("should discover BlockGrid structure with multiple blocks", () => {
    const blockGridValue = {
      layout: { "Umbraco.BlockGrid": [] },
      contentData: [
        {
          key: "block-key-1",
          contentTypeKey: "content-type-1",
          values: []
        },
        {
          key: "block-key-2",
          contentTypeKey: "content-type-2",
          values: []
        }
      ],
      settingsData: [
        {
          key: "settings-key-1",
          contentTypeKey: "settings-type-1",
          values: []
        }
      ]
    };

    const result = discoverAllBlockArrays(blockGridValue);

    expect(result).toHaveLength(1);
    expect(result[0].contentData).toHaveLength(2);
    expect(result[0].settingsData).toHaveLength(1);
  });

  it("should discover nested blocks in RichText structure", () => {
    const richTextValue = {
      markup: "<p>Content</p>",
      blocks: {
        layout: {},
        contentData: [
          {
            key: "nested-block-1",
            contentTypeKey: "nested-type-1",
            values: []
          }
        ],
        settingsData: []
      }
    };

    const documentValue = {
      contentData: [
        {
          key: "parent-block-1",
          contentTypeKey: "parent-type-1",
          values: [
            {
              alias: "richText",
              value: richTextValue
            }
          ]
        }
      ],
      settingsData: []
    };

    const result = discoverAllBlockArrays(documentValue);

    // Should find both parent and nested block structures
    expect(result).toHaveLength(2);
    expect(result[0].path).toBe("root");
    expect(result[1].path).toContain("richText");
    expect(result[1].path).toContain("blocks");
  });

  it("should discover deeply nested block structures", () => {
    const deeplyNestedValue = {
      contentData: [
        {
          key: "level-1-block",
          contentTypeKey: "type-1",
          values: [
            {
              alias: "richText",
              value: {
                markup: "<p>Level 2</p>",
                blocks: {
                  contentData: [
                    {
                      key: "level-2-block",
                      contentTypeKey: "type-2",
                      values: [
                        {
                          alias: "nestedRichText",
                          value: {
                            markup: "<p>Level 3</p>",
                            blocks: {
                              contentData: [
                                {
                                  key: "level-3-block",
                                  contentTypeKey: "type-3",
                                  values: []
                                }
                              ],
                              settingsData: []
                            }
                          }
                        }
                      ]
                    }
                  ],
                  settingsData: []
                }
              }
            }
          ]
        }
      ],
      settingsData: []
    };

    const result = discoverAllBlockArrays(deeplyNestedValue);

    // Should find all three levels
    expect(result).toHaveLength(3);
    expect(result[0].path).toBe("root");
    expect(result[1].path).toContain("richText");
    expect(result[2].path).toContain("nestedRichText");
  });

  it("should discover blocks in settingsData", () => {
    const valueWithNestedSettings = {
      contentData: [],
      settingsData: [
        {
          key: "settings-block-1",
          contentTypeKey: "settings-type-1",
          values: [
            {
              alias: "nestedBlockProperty",
              value: {
                contentData: [
                  {
                    key: "nested-in-settings",
                    contentTypeKey: "nested-type",
                    values: []
                  }
                ],
                settingsData: []
              }
            }
          ]
        }
      ]
    };

    const result = discoverAllBlockArrays(valueWithNestedSettings);

    expect(result).toHaveLength(2);
    expect(result[0].path).toBe("root");
    expect(result[1].path).toContain("settingsData");
  });
});
