import GetUserCurrentConfigurationTool from "../get/get-user-current-configuration.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";

describe("get-user-current-configuration", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it("should get the current user configuration", async () => {
    // Act
    const result = await GetUserCurrentConfigurationTool().handler({}, { signal: new AbortController().signal });

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify expected properties exist
    const parsed = JSON.parse(result.content[0].text as string);
    expect(parsed).toHaveProperty("keepUserLoggedIn");
    expect(parsed).toHaveProperty("passwordConfiguration");
    expect(parsed.passwordConfiguration).toHaveProperty("minimumPasswordLength");
    expect(parsed.passwordConfiguration).toHaveProperty("requireNonLetterOrDigit");
    expect(parsed.passwordConfiguration).toHaveProperty("requireDigit");
    expect(parsed.passwordConfiguration).toHaveProperty("requireLowercase");
    expect(parsed.passwordConfiguration).toHaveProperty("requireUppercase");
  });
});