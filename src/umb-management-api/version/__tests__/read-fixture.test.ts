import { describe, it, expect } from "@jest/globals";
import { readFixture } from "../read-fixture.js";

interface Sample {
  name: string;
  items: number[];
}

describe("readFixture", () => {
  it("loads JSON from a URL relative to the importing module", () => {
    const data = readFixture<Sample>(
      new URL("./fixtures/sample.json", import.meta.url),
    );

    expect(data).toEqual({ name: "demo", items: [1, 2, 3] });
  });

  it("throws if the file is missing", () => {
    expect(() =>
      readFixture(new URL("./fixtures/does-not-exist.json", import.meta.url)),
    ).toThrow();
  });
});
