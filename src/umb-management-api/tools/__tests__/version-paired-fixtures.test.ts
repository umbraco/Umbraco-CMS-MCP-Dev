import { describe, it, expect } from "@jest/globals";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolsRoot = path.resolve(__dirname, "..");

const findFixtures = (dir: string): string[] => {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "__tests__" || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...findFixtures(full));
    } else if (entry.isFile() && entry.name.endsWith(".pre174.json")) {
      out.push(full);
    }
  }
  return out;
};

const fixtures = findFixtures(toolsRoot);

describe("version-paired fixtures match their tool outputSchema", () => {
  if (fixtures.length === 0) {
    it("no paired fixtures found yet (this is expected before the pilot ships)", () => {
      expect(fixtures).toEqual([]);
    });
    return;
  }

  it.each(fixtures)("%s parses against its tool's outputSchema", async (fixturePath) => {
    const toolPath = fixturePath.replace(/\.pre174\.json$/, ".ts");
    expect(fs.existsSync(toolPath)).toBe(true);

    const mod = await import(pathToFileURL(toolPath).href);
    const tool = mod.default;
    expect(tool?.outputSchema).toBeDefined();

    // The fixture file is the full MCP tool-result envelope:
    //   { content: [{ type: "text", text: "<json>" }] }
    // outputSchema describes the inner payload — JSON.parse `content[0].text`
    // before validating.
    const envelope = JSON.parse(fs.readFileSync(fixturePath, "utf8")) as {
      content?: Array<{ type?: string; text?: string }>;
    };
    const innerText = envelope.content?.[0]?.text;
    if (typeof innerText !== "string") {
      throw new Error(
        `Fixture ${path.basename(fixturePath)} is not a tool-result envelope (expected content[0].text to be a string)`,
      );
    }
    const payload = JSON.parse(innerText);

    const schema = tool.outputSchema instanceof z.ZodType
      ? tool.outputSchema
      : z.object(tool.outputSchema as z.ZodRawShape);

    const result = schema.safeParse(payload);
    if (!result.success) {
      throw new Error(
        `Fixture ${path.basename(fixturePath)} payload failed schema validation:\n${
          result.error.message
        }`,
      );
    }
  });
});
