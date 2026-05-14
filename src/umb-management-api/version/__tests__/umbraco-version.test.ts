import { describe, it, expect, beforeEach } from "@jest/globals";
import {
  setUmbracoVersion,
  resetUmbracoVersion,
  isAtLeast,
} from "../umbraco-version.js";

describe("umbraco-version", () => {
  beforeEach(() => {
    resetUmbracoVersion();
  });

  it("returns false when version is unknown", () => {
    expect(isAtLeast("17.4")).toBe(false);
  });

  it("returns true when version equals target", () => {
    setUmbracoVersion("17.4.0");
    expect(isAtLeast("17.4")).toBe(true);
  });

  it("returns true when version exceeds target by minor", () => {
    setUmbracoVersion("17.5.0");
    expect(isAtLeast("17.4")).toBe(true);
  });

  it("returns true when version exceeds target by major", () => {
    setUmbracoVersion("18.0.0");
    expect(isAtLeast("17.4")).toBe(true);
  });

  it("returns false when version is below target by minor", () => {
    setUmbracoVersion("17.3.9");
    expect(isAtLeast("17.4")).toBe(false);
  });

  it("returns false when version is below target by major", () => {
    setUmbracoVersion("16.99.99");
    expect(isAtLeast("17.4")).toBe(false);
  });

  it("treats pre-release suffixes as equal to base version", () => {
    setUmbracoVersion("17.4.0-beta.1");
    expect(isAtLeast("17.4")).toBe(true);
  });

  it("accepts a two-part target like 17.4", () => {
    setUmbracoVersion("17.4.2");
    expect(isAtLeast("17.4")).toBe(true);
  });

  it("ignores garbage version strings (treats as unknown)", () => {
    setUmbracoVersion("not-a-version");
    expect(isAtLeast("17.4")).toBe(false);
  });
});
