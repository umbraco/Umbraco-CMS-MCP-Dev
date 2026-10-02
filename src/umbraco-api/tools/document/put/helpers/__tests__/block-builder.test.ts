import {
  buildBlockEntry,
  buildExposeEntries,
  buildLayoutEntry,
  buildRteBlockElement,
  checkAllowedInArea,
  collectNestedAreaContentKeys,
  createEmptyBlockValue,
  findAreaConfiguration,
  findBlockTypeConfiguration,
  findLayoutLocation,
  findRteBlockElement,
  getBlockEditorKind,
  getBlockTypeConfigurations,
  getTopLevelBlockContainer,
  insertAtPosition,
  insertRteBlockElement,
  isBlockListOrGridValue,
  isRteWithBlocks,
  normaliseRichTextBlockValue,
  removeBlockFromContainer,
  removeRteBlockElement,
  type BlockLayoutItem,
  type BlockTypeConfiguration
} from "../block-builder.js";

const KEY_A = "aaaaaaaa-0000-0000-0000-000000000001";
const KEY_B = "bbbbbbbb-0000-0000-0000-000000000002";
const KEY_C = "cccccccc-0000-0000-0000-000000000003";
const SETTINGS_KEY = "dddddddd-0000-0000-0000-000000000004";
const TYPE_KEY = "eeeeeeee-0000-0000-0000-000000000005";
const OTHER_TYPE_KEY = "ffffffff-0000-0000-0000-000000000006";
const AREA_KEY = "11111111-0000-0000-0000-000000000007";
const GROUP_KEY = "22222222-0000-0000-0000-000000000008";

describe("block-builder helpers", () => {
  describe("getBlockEditorKind", () => {
    it("should map block editor aliases", () => {
      expect(getBlockEditorKind("Umbraco.BlockList")).toBe("BlockList");
      expect(getBlockEditorKind("Umbraco.BlockGrid")).toBe("BlockGrid");
      expect(getBlockEditorKind("Umbraco.RichText")).toBe("RichText");
    });

    it("should return null for non-block editors", () => {
      expect(getBlockEditorKind("Umbraco.TextBox")).toBeNull();
      expect(getBlockEditorKind(undefined)).toBeNull();
    });
  });

  describe("isBlockListOrGridValue / isRteWithBlocks", () => {
    it("should distinguish BlockList/Grid from RichText values", () => {
      const list = createEmptyBlockValue("BlockList");
      const rte = createEmptyBlockValue("RichText");
      expect(isBlockListOrGridValue(list)).toBe(true);
      expect(isRteWithBlocks(list)).toBe(false);
      expect(isRteWithBlocks(rte)).toBe(true);
      expect(isBlockListOrGridValue(rte)).toBe(false);
    });
  });

  describe("createEmptyBlockValue", () => {
    it("should key the layout by editor alias", () => {
      expect(createEmptyBlockValue("BlockGrid").layout).toEqual({ "Umbraco.BlockGrid": [] });
      expect(createEmptyBlockValue("RichText")).toEqual({
        markup: "",
        blocks: { layout: { "Umbraco.RichText": [] }, contentData: [], settingsData: [], expose: [] }
      });
    });
  });

  describe("getTopLevelBlockContainer", () => {
    it("should normalise missing layout and expose in place", () => {
      const value: any = { contentData: [], settingsData: [] };
      const container = getTopLevelBlockContainer(value, "BlockList");
      expect(container).not.toBeNull();
      expect(value.layout).toEqual({ "Umbraco.BlockList": [] });
      expect(container!.expose).toBe(value.expose);
      expect(container!.layoutItems).toBe(value.layout["Umbraco.BlockList"]);
    });

    it("should return the top-level RichText blocks container", () => {
      const value = createEmptyBlockValue("RichText");
      const container = getTopLevelBlockContainer(value, "RichText");
      expect(container!.contentData).toBe(value.blocks.contentData);
      expect(container!.layoutItems).toBe(value.blocks.layout["Umbraco.RichText"]);
    });

    it("should return the top-level container, not a nested one", () => {
      const nested = createEmptyBlockValue("BlockList");
      const value = createEmptyBlockValue("BlockGrid");
      value.contentData.push({ key: KEY_A, contentTypeKey: TYPE_KEY, values: [{ alias: "inner", value: nested }] });
      const container = getTopLevelBlockContainer(value, "BlockGrid");
      expect(container!.contentData).toBe(value.contentData);
    });

    it("should normalise a null layout and expose in place", () => {
      const value: any = { layout: null, contentData: [], settingsData: [], expose: null };
      getTopLevelBlockContainer(value, "BlockGrid");
      expect(value.layout).toEqual({ "Umbraco.BlockGrid": [] });
      expect(value.expose).toEqual([]);
    });

    it("should throw instead of resetting a present but malformed layout or expose", () => {
      const withBlock = (overrides: Record<string, unknown>) => ({
        layout: { "Umbraco.BlockList": [{ contentKey: KEY_A }] },
        contentData: [buildBlockEntry(KEY_A, TYPE_KEY, [])],
        settingsData: [],
        expose: buildExposeEntries(KEY_A, []),
        ...overrides
      });

      const layoutNotArray: any = withBlock({ layout: { "Umbraco.BlockList": { contentKey: KEY_A } } });
      expect(() => getTopLevelBlockContainer(layoutNotArray, "BlockList")).toThrow(/malformed block structure/);
      expect(layoutNotArray.layout).toEqual({ "Umbraco.BlockList": { contentKey: KEY_A } });

      const layoutNotObject: any = withBlock({ layout: [{ contentKey: KEY_A }] });
      expect(() => getTopLevelBlockContainer(layoutNotObject, "BlockList")).toThrow(/malformed block structure/);

      const exposeString: any = withBlock({ expose: "broken" });
      expect(() => getTopLevelBlockContainer(exposeString, "BlockList")).toThrow(/malformed block structure/);
      expect(exposeString.expose).toBe("broken");
    });

    it("should return null when the structure doesn't match the editor", () => {
      expect(getTopLevelBlockContainer(createEmptyBlockValue("BlockList"), "RichText")).toBeNull();
      expect(getTopLevelBlockContainer({ foo: 1 }, "BlockList")).toBeNull();
    });
  });

  describe("normaliseRichTextBlockValue", () => {
    it("should initialise missing markup and blocks", () => {
      const value: any = { markup: null };
      normaliseRichTextBlockValue(value);
      expect(value).toEqual(createEmptyBlockValue("RichText"));

      const partial: any = { markup: "<p>Hi</p>", blocks: { layout: {} } };
      normaliseRichTextBlockValue(partial);
      expect(partial.blocks).toEqual({ layout: {}, contentData: [], settingsData: [] });
    });

    it("should throw instead of resetting present but malformed fields", () => {
      const blocksNumber: any = { markup: "<p>Hi</p>", blocks: 42 };
      expect(() => normaliseRichTextBlockValue(blocksNumber)).toThrow(/malformed block structure/);
      expect(blocksNumber.blocks).toBe(42);

      const markupObject: any = { markup: { html: "<p>Hi</p>" }, blocks: createEmptyBlockValue("RichText").blocks };
      expect(() => normaliseRichTextBlockValue(markupObject)).toThrow(/malformed block structure/);

      const contentDataObject: any = { markup: "", blocks: { contentData: {}, settingsData: [] } };
      expect(() => normaliseRichTextBlockValue(contentDataObject)).toThrow(/malformed block structure/);
      expect(contentDataObject.blocks.contentData).toEqual({});
    });
  });

  describe("buildBlockEntry", () => {
    it("should normalise culture and segment to null", () => {
      expect(buildBlockEntry(KEY_A, TYPE_KEY, [{ alias: "title", value: "Hi" }])).toEqual({
        key: KEY_A,
        contentTypeKey: TYPE_KEY,
        values: [{ alias: "title", culture: null, segment: null, value: "Hi" }]
      });
    });
  });

  describe("buildLayoutEntry", () => {
    it("should build a BlockList entry with only keys", () => {
      expect(buildLayoutEntry("BlockList", { contentKey: KEY_A })).toEqual({ contentKey: KEY_A });
      expect(buildLayoutEntry("RichText", { contentKey: KEY_A, settingsKey: SETTINGS_KEY }))
        .toEqual({ contentKey: KEY_A, settingsKey: SETTINGS_KEY });
    });

    it("should default BlockGrid spans to 12/1 and write empty areas", () => {
      expect(buildLayoutEntry("BlockGrid", { contentKey: KEY_A, areaKeys: [AREA_KEY] })).toEqual({
        contentKey: KEY_A,
        columnSpan: 12,
        rowSpan: 1,
        areas: [{ key: AREA_KEY, items: [] }]
      });
    });
  });

  describe("buildExposeEntries", () => {
    it("should build one invariant entry by default", () => {
      expect(buildExposeEntries(KEY_A, [])).toEqual([{ contentKey: KEY_A, culture: null, segment: null }]);
    });

    it("should build one entry per distinct culture", () => {
      expect(buildExposeEntries(KEY_A, ["en-US", "da-DK", "en-US"])).toEqual([
        { contentKey: KEY_A, culture: "en-US", segment: null },
        { contentKey: KEY_A, culture: "da-DK", segment: null }
      ]);
    });
  });

  describe("insertAtPosition", () => {
    const keyOf = (i: { contentKey: string }) => i.contentKey;
    const make = () => [{ contentKey: KEY_A }, { contentKey: KEY_B }];

    it("should append and prepend", () => {
      const items = make();
      insertAtPosition(items, { contentKey: KEY_C }, { position: "append" }, keyOf);
      expect(items.map(keyOf)).toEqual([KEY_A, KEY_B, KEY_C]);
      const items2 = make();
      insertAtPosition(items2, { contentKey: KEY_C }, { position: "prepend" }, keyOf);
      expect(items2.map(keyOf)).toEqual([KEY_C, KEY_A, KEY_B]);
    });

    it("should insert before and after a sibling", () => {
      const items = make();
      insertAtPosition(items, { contentKey: KEY_C }, { position: "before", contentKey: KEY_B }, keyOf);
      expect(items.map(keyOf)).toEqual([KEY_A, KEY_C, KEY_B]);
      const items2 = make();
      insertAtPosition(items2, { contentKey: KEY_C }, { position: "after", contentKey: KEY_A }, keyOf);
      expect(items2.map(keyOf)).toEqual([KEY_A, KEY_C, KEY_B]);
    });

    it("should return false and leave the array untouched for a missing sibling", () => {
      const items = make();
      expect(insertAtPosition(items, { contentKey: KEY_C }, { position: "after", contentKey: SETTINGS_KEY }, keyOf)).toBe(false);
      expect(items.map(keyOf)).toEqual([KEY_A, KEY_B]);
    });
  });

  describe("findLayoutLocation / collectNestedAreaContentKeys", () => {
    const layout = (): BlockLayoutItem[] => [
      {
        contentKey: KEY_A,
        areas: [{ key: AREA_KEY, items: [{ contentKey: KEY_B, areas: [{ key: AREA_KEY, items: [{ contentKey: KEY_C }] }] }] }]
      }
    ];

    it("should find root and nested area items", () => {
      const items = layout();
      expect(findLayoutLocation(items, KEY_A)).toMatchObject({ index: 0, parent: undefined, areaKey: undefined });
      const nested = findLayoutLocation(items, KEY_C);
      expect(nested?.parent?.contentKey).toBe(KEY_B);
      expect(nested?.areaKey).toBe(AREA_KEY);
      expect(findLayoutLocation(items, SETTINGS_KEY)).toBeNull();
    });

    it("should collect all nested area content keys", () => {
      expect(collectNestedAreaContentKeys(layout()[0])).toEqual([KEY_B, KEY_C]);
      expect(collectNestedAreaContentKeys({ contentKey: KEY_A })).toEqual([]);
    });
  });

  describe("removeBlockFromContainer", () => {
    it("should remove layout, content, settings, and every expose entry", () => {
      const value = createEmptyBlockValue("BlockList");
      value.layout["Umbraco.BlockList"].push({ contentKey: KEY_A, settingsKey: SETTINGS_KEY }, { contentKey: KEY_B });
      value.contentData.push(buildBlockEntry(KEY_A, TYPE_KEY, []), buildBlockEntry(KEY_B, TYPE_KEY, []));
      value.settingsData.push(buildBlockEntry(SETTINGS_KEY, OTHER_TYPE_KEY, []));
      value.expose.push(...buildExposeEntries(KEY_A, ["en-US", "da-DK"]), ...buildExposeEntries(KEY_B, []));

      const container = getTopLevelBlockContainer(value, "BlockList")!;
      const removed = removeBlockFromContainer(container, findLayoutLocation(container.layoutItems, KEY_A)!);

      expect(removed?.settingsKey).toBe(SETTINGS_KEY);
      expect(value.layout["Umbraco.BlockList"]).toEqual([{ contentKey: KEY_B }]);
      expect(value.contentData.map((b: any) => b.key)).toEqual([KEY_B]);
      expect(value.settingsData).toEqual([]);
      expect(value.expose.map((e: any) => e.contentKey)).toEqual([KEY_B]);
    });

    it("should return null when there is no contentData entry", () => {
      const value = createEmptyBlockValue("BlockList");
      value.layout["Umbraco.BlockList"].push({ contentKey: KEY_A });
      const container = getTopLevelBlockContainer(value, "BlockList")!;
      expect(removeBlockFromContainer(container, findLayoutLocation(container.layoutItems, KEY_A)!)).toBeNull();
      expect(value.layout["Umbraco.BlockList"]).toHaveLength(1);
    });
  });

  describe("RichText markup", () => {
    const blockA = buildRteBlockElement(KEY_A);

    it("should build block and inline elements", () => {
      expect(blockA).toBe(`<umb-rte-block data-content-key="${KEY_A}"><!--Umbraco-Block--></umb-rte-block>`);
      expect(buildRteBlockElement(KEY_A, true)).toContain("<umb-rte-block-inline ");
    });

    it("should insert relative to a sibling element", () => {
      const markup = `<p>Intro</p>${blockA}<p>Outro</p>`;
      const element = buildRteBlockElement(KEY_B);
      expect(insertRteBlockElement(markup, element, { position: "before", contentKey: KEY_A }))
        .toBe(`<p>Intro</p>${element}${blockA}<p>Outro</p>`);
      expect(insertRteBlockElement(markup, element, { position: "after", contentKey: KEY_A }))
        .toBe(`<p>Intro</p>${blockA}${element}<p>Outro</p>`);
      expect(insertRteBlockElement(markup, element, { position: "append" })).toBe(markup + element);
      expect(insertRteBlockElement(markup, element, { position: "prepend" })).toBe(element + markup);
      expect(insertRteBlockElement(markup, element, { position: "after", contentKey: KEY_C })).toBeNull();
    });

    it("should wrap appended inline blocks in a paragraph", () => {
      const inline = buildRteBlockElement(KEY_B, true);
      expect(insertRteBlockElement("", inline, { position: "append" }, true)).toBe(`<p>${inline}</p>`);
    });

    it("should find and remove block elements, including self-closing ones", () => {
      const selfClosing = `<umb-rte-block data-content-key="${KEY_B}"/>`;
      const markup = `<p>Intro</p>${blockA}${selfClosing}`;
      expect(findRteBlockElement(markup, KEY_A)).not.toBeNull();
      expect(removeRteBlockElement(markup, KEY_A)).toBe(`<p>Intro</p>${selfClosing}`);
      expect(removeRteBlockElement(markup, KEY_B)).toBe(`<p>Intro</p>${blockA}`);
      expect(removeRteBlockElement(markup, KEY_C)).toBeNull();
    });

    it("should drop a paragraph left empty by removing an inline block", () => {
      const markup = `<p>${buildRteBlockElement(KEY_A, true)}</p><p>Keep</p>`;
      expect(removeRteBlockElement(markup, KEY_A)).toBe("<p>Keep</p>");
    });

    it("should leave unrelated empty paragraphs untouched", () => {
      const spacer = "<p> </p>";
      const markup = `<p>Intro</p>${spacer}<p>${buildRteBlockElement(KEY_A, true)}</p><p></p>${blockA}<p>Outro</p>`;
      expect(removeRteBlockElement(markup, KEY_A)).toBe(`<p>Intro</p>${spacer}<p></p>${blockA}<p>Outro</p>`);
    });

    it("should keep a paragraph that holds other content besides the removed inline block", () => {
      const markup = `<p>Before ${buildRteBlockElement(KEY_A, true)} after</p>`;
      expect(removeRteBlockElement(markup, KEY_A)).toBe("<p>Before  after</p>");
    });
  });

  describe("block type configuration", () => {
    const configs: BlockTypeConfiguration[] = [
      {
        contentElementTypeKey: TYPE_KEY,
        areas: [{ key: AREA_KEY, alias: "main", specifiedAllowance: [] }]
      },
      { contentElementTypeKey: OTHER_TYPE_KEY, groupKey: GROUP_KEY }
    ];

    it("should read blocks from data type values", () => {
      expect(getBlockTypeConfigurations([{ alias: "blocks", value: configs }])).toBe(configs);
      expect(getBlockTypeConfigurations([{ alias: "other", value: 1 }])).toEqual([]);
      expect(getBlockTypeConfigurations(undefined)).toEqual([]);
    });

    it("should find block and area configuration", () => {
      expect(findBlockTypeConfiguration(configs, OTHER_TYPE_KEY)?.groupKey).toBe(GROUP_KEY);
      expect(findAreaConfiguration(configs, TYPE_KEY, AREA_KEY)?.alias).toBe("main");
      expect(findAreaConfiguration(configs, OTHER_TYPE_KEY, AREA_KEY)).toBeUndefined();
    });

    it("should allow any block in an area without specified allowance", () => {
      expect(checkAllowedInArea(configs[1], { key: AREA_KEY })).toBeNull();
    });

    it("should honour allowInAreas and specified allowance by element type or group", () => {
      expect(checkAllowedInArea({ contentElementTypeKey: TYPE_KEY, allowInAreas: false }, { key: AREA_KEY })).not.toBeNull();
      const restricted = { key: AREA_KEY, alias: "main", specifiedAllowance: [{ elementTypeKey: TYPE_KEY }] };
      expect(checkAllowedInArea(configs[0], restricted)).toBeNull();
      expect(checkAllowedInArea(configs[1], restricted)).toContain("not allowed in area 'main'");
      expect(checkAllowedInArea(configs[1], { key: AREA_KEY, specifiedAllowance: [{ groupKey: GROUP_KEY }] })).toBeNull();
    });
  });
});
