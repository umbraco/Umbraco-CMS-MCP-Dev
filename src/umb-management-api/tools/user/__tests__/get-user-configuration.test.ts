import GetUserConfigurationTool from "../get/get-user-configuration.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";

describe("get-user-configuration", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it("should get the user configuration", async () => {
    // Act
    const result = await GetUserConfigurationTool().handler({}, { signal: new AbortController().signal });

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify expected properties exist
    const parsed = JSON.parse(result.content[0].text as string);
    expect(parsed).toHaveProperty("canInviteUsers");
    expect(parsed).toHaveProperty("usernameIsEmail");
    expect(parsed).toHaveProperty("passwordConfiguration");
    expect(parsed.passwordConfiguration).toHaveProperty("minimumPasswordLength");
    expect(parsed.passwordConfiguration).toHaveProperty("requireNonLetterOrDigit");
    expect(parsed.passwordConfiguration).toHaveProperty("requireDigit");
    expect(parsed.passwordConfiguration).toHaveProperty("requireLowercase");
    expect(parsed.passwordConfiguration).toHaveProperty("requireUppercase");
  });
});