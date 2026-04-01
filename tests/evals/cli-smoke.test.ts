import { describe, it, expect } from "@jest/globals";
import { query } from "@anthropic-ai/claude-agent-sdk";

const SKILL_PATH = "plugins-server/skills/umb-cms-cli/SKILL.md";

describe("cli skill smoke test", () => {
  it("should call a tool using the skill", async () => {
    let result = "";

    for await (const message of query({
      prompt: "Read the CLI skill file, then use it to call the 'get-server-information' tool directly. When done, say 'TOOL_CALLED' and include the server version in your response.",
      options: {
        model: "claude-haiku-4-5",
        cwd: process.cwd(),
        allowedTools: ["Bash", "Read"],
        permissionMode: "bypassPermissions",
        allowDangerouslySkipPermissions: true,
        systemPrompt: `You are testing an Umbraco MCP server CLI. There is a skill file at '${SKILL_PATH}' that contains instructions for using the CLI. Read it first, then follow its instructions to complete the task.`,
        maxTurns: 15,
      },
    })) {
      if ("result" in message) {
        result = message.result;
      }
    }

    expect(result).toContain("TOOL_CALLED");
  }, 120000);
});
