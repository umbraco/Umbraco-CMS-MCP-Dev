import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Umbraco uses GUIDs that are not RFC 4122 compliant UUIDs. For example,
 * document version IDs are sequential integers packed into GUID format
 * (e.g. 0000003f-0000-0000-0000-000000000000). Zod's uuid() enforces
 * RFC 4122 version/variant bits and rejects these.
 *
 * The Orval afterAllFilesWrite hook `relaxUuidToGuid` replaces zod.uuid()
 * with zod.guid() in generated files. This test ensures that replacement
 * has been applied — if it fails, the hook didn't run or was removed.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const zodFilePath = path.resolve(
  __dirname,
  "../../api/umbracoManagementAPI.zod.ts"
);

describe("generated zod schemas use guid() not uuid()", () => {
  let content: string;

  beforeAll(() => {
    content = fs.readFileSync(zodFilePath, "utf8");
  });

  it("should not contain zod.uuid() calls", () => {
    const uuidMatches = content.match(/zod\.uuid\(\)/g);
    expect(uuidMatches).toBeNull();
  });

  it("should contain zod.guid() calls", () => {
    const guidMatches = content.match(/zod\.guid\(\)/g);
    expect(guidMatches).not.toBeNull();
    expect(guidMatches!.length).toBeGreaterThan(0);
  });
});
