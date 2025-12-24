import { matchesProperty, getPropertyKey } from "../property-matching.js";

describe("property-matching helpers", () => {
  describe("matchesProperty", () => {
    describe("alias matching", () => {
      it("should return true when alias matches exactly", () => {
        const value = { alias: "title", culture: null, segment: null };
        expect(matchesProperty(value, "title")).toBe(true);
      });

      it("should return false when alias does not match", () => {
        const value = { alias: "title", culture: null, segment: null };
        expect(matchesProperty(value, "author")).toBe(false);
      });

      it("should be case-sensitive for alias", () => {
        const value = { alias: "title", culture: null, segment: null };
        expect(matchesProperty(value, "Title")).toBe(false);
        expect(matchesProperty(value, "TITLE")).toBe(false);
      });
    });

    describe("culture matching", () => {
      it("should match when both cultures are the same string", () => {
        const value = { alias: "title", culture: "en-US", segment: null };
        expect(matchesProperty(value, "title", "en-US")).toBe(true);
      });

      it("should not match when cultures differ", () => {
        const value = { alias: "title", culture: "en-US", segment: null };
        expect(matchesProperty(value, "title", "da-DK")).toBe(false);
      });

      it("should match when both cultures are null", () => {
        const value = { alias: "title", culture: null, segment: null };
        expect(matchesProperty(value, "title", null)).toBe(true);
      });

      it("should match when both cultures are undefined", () => {
        const value = { alias: "title", segment: null };
        expect(matchesProperty(value, "title", undefined)).toBe(true);
      });

      it("should match when value culture is null and search culture is undefined", () => {
        const value = { alias: "title", culture: null, segment: null };
        expect(matchesProperty(value, "title", undefined)).toBe(true);
      });

      it("should match when value culture is undefined and search culture is null", () => {
        const value = { alias: "title", segment: null };
        expect(matchesProperty(value, "title", null)).toBe(true);
      });

      it("should not match when value has culture but search has none", () => {
        const value = { alias: "title", culture: "en-US", segment: null };
        expect(matchesProperty(value, "title", null)).toBe(false);
        expect(matchesProperty(value, "title", undefined)).toBe(false);
      });

      it("should not match when search has culture but value has none", () => {
        const value = { alias: "title", culture: null, segment: null };
        expect(matchesProperty(value, "title", "en-US")).toBe(false);
      });
    });

    describe("segment matching", () => {
      it("should match when both segments are the same string", () => {
        const value = { alias: "title", culture: null, segment: "premium" };
        expect(matchesProperty(value, "title", null, "premium")).toBe(true);
      });

      it("should not match when segments differ", () => {
        const value = { alias: "title", culture: null, segment: "premium" };
        expect(matchesProperty(value, "title", null, "standard")).toBe(false);
      });

      it("should match when both segments are null", () => {
        const value = { alias: "title", culture: null, segment: null };
        expect(matchesProperty(value, "title", null, null)).toBe(true);
      });

      it("should match when both segments are undefined", () => {
        const value = { alias: "title", culture: null };
        expect(matchesProperty(value, "title", null, undefined)).toBe(true);
      });

      it("should match when value segment is null and search segment is undefined", () => {
        const value = { alias: "title", culture: null, segment: null };
        expect(matchesProperty(value, "title", null, undefined)).toBe(true);
      });

      it("should match when value segment is undefined and search segment is null", () => {
        const value = { alias: "title", culture: null };
        expect(matchesProperty(value, "title", null, null)).toBe(true);
      });

      it("should not match when value has segment but search has none", () => {
        const value = { alias: "title", culture: null, segment: "premium" };
        expect(matchesProperty(value, "title", null, null)).toBe(false);
        expect(matchesProperty(value, "title", null, undefined)).toBe(false);
      });

      it("should not match when search has segment but value has none", () => {
        const value = { alias: "title", culture: null, segment: null };
        expect(matchesProperty(value, "title", null, "premium")).toBe(false);
      });
    });

    describe("combined culture and segment matching", () => {
      it("should match when alias, culture, and segment all match", () => {
        const value = { alias: "title", culture: "en-US", segment: "premium" };
        expect(matchesProperty(value, "title", "en-US", "premium")).toBe(true);
      });

      it("should not match when alias matches but culture differs", () => {
        const value = { alias: "title", culture: "en-US", segment: "premium" };
        expect(matchesProperty(value, "title", "da-DK", "premium")).toBe(false);
      });

      it("should not match when alias and culture match but segment differs", () => {
        const value = { alias: "title", culture: "en-US", segment: "premium" };
        expect(matchesProperty(value, "title", "en-US", "standard")).toBe(false);
      });

      it("should match invariant property with no culture or segment", () => {
        const value = { alias: "author", culture: null, segment: null };
        expect(matchesProperty(value, "author")).toBe(true);
        expect(matchesProperty(value, "author", null, null)).toBe(true);
        expect(matchesProperty(value, "author", undefined, undefined)).toBe(true);
      });
    });
  });

  describe("getPropertyKey", () => {
    describe("basic alias formatting", () => {
      it("should return just the alias when no culture or segment", () => {
        expect(getPropertyKey("title")).toBe("title");
      });

      it("should return just the alias when culture and segment are null", () => {
        expect(getPropertyKey("title", null, null)).toBe("title");
      });

      it("should return just the alias when culture and segment are undefined", () => {
        expect(getPropertyKey("title", undefined, undefined)).toBe("title");
      });
    });

    describe("culture formatting", () => {
      it("should append culture in brackets when provided", () => {
        expect(getPropertyKey("title", "en-US")).toBe("title[en-US]");
      });

      it("should append culture in brackets when segment is null", () => {
        expect(getPropertyKey("title", "en-US", null)).toBe("title[en-US]");
      });

      it("should handle various culture codes", () => {
        expect(getPropertyKey("title", "da-DK")).toBe("title[da-DK]");
        expect(getPropertyKey("title", "fr-FR")).toBe("title[fr-FR]");
        expect(getPropertyKey("title", "zh-CN")).toBe("title[zh-CN]");
      });
    });

    describe("segment formatting", () => {
      it("should append segment in brackets when provided without culture", () => {
        expect(getPropertyKey("title", null, "premium")).toBe("title[premium]");
      });

      it("should append segment in brackets when culture is undefined", () => {
        expect(getPropertyKey("title", undefined, "premium")).toBe("title[premium]");
      });

      it("should handle various segment names", () => {
        expect(getPropertyKey("price", null, "standard")).toBe("price[standard]");
        expect(getPropertyKey("price", null, "enterprise")).toBe("price[enterprise]");
      });
    });

    describe("combined culture and segment formatting", () => {
      it("should append both culture and segment in separate brackets", () => {
        expect(getPropertyKey("title", "en-US", "premium")).toBe("title[en-US][premium]");
      });

      it("should maintain order: alias[culture][segment]", () => {
        const result = getPropertyKey("description", "da-DK", "standard");
        expect(result).toBe("description[da-DK][standard]");
        expect(result.indexOf("[da-DK]")).toBeLessThan(result.indexOf("[standard]"));
      });

      it("should handle complex real-world scenarios", () => {
        expect(getPropertyKey("metaDescription", "en-US", "seo")).toBe("metaDescription[en-US][seo]");
        expect(getPropertyKey("pageTitle", "fr-FR", "mobile")).toBe("pageTitle[fr-FR][mobile]");
      });
    });

    describe("edge cases", () => {
      it("should handle empty string alias", () => {
        expect(getPropertyKey("")).toBe("");
      });

      it("should handle alias with special characters", () => {
        expect(getPropertyKey("my-property")).toBe("my-property");
        expect(getPropertyKey("my_property")).toBe("my_property");
      });

      it("should not add brackets for empty string culture", () => {
        // Empty string is falsy, so no brackets added
        expect(getPropertyKey("title", "")).toBe("title");
      });

      it("should not add brackets for empty string segment", () => {
        // Empty string is falsy, so no brackets added
        expect(getPropertyKey("title", null, "")).toBe("title");
      });
    });
  });
});
