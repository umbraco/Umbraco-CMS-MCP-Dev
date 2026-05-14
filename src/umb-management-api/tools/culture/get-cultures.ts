import { GetCultureParams } from "@/umb-management-api/schemas/index.js";
import { getCultureQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";
import { withVersionDispatch } from "../../version/version-dispatch.js";
import { readFixture } from "../../version/read-fixture.js";
import { post174 } from "./get-cultures.post174.js";

// Unified shape — matches what 17.4 returns. Pre-17.4, Umbraco returned some
// cultures with empty `name` strings; the pre-17.4 fixture below presents the
// clean shape the chained editor MCP expects, even though the live API on
// older Umbracos wouldn't produce it. Shape stability > value fidelity.
const outputSchema = z.object({
  total: z.number(),
  items: z.array(
    z.object({
      name: z.string(),
      englishName: z.string(),
    }),
  ),
});

type ToolResult = Awaited<ReturnType<typeof post174>>;

const pre174Fixture = readFixture<ToolResult>(
  new URL("./get-cultures.pre174.json", import.meta.url),
);

const GetCulturesTool = {
  name: "get-culture",
  description:
    "Retrieves a paginated list of cultures that Umbraco can be configured to use",
  inputSchema: getCultureQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ["list"],
  handler: withVersionDispatch({
    pre174: (_params: GetCultureParams) => pre174Fixture,
    post174,
  }),
} satisfies ToolDefinition<
  typeof getCultureQueryParams.shape,
  typeof outputSchema.shape
>;

export default withStandardDecorators(GetCulturesTool);
