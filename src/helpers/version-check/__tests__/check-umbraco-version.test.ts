import { jest } from "@jest/globals";
import {
  checkUmbracoVersion,
  getVersionCheckMessage,
  clearVersionCheckMessage,
  isToolExecutionBlocked
} from "../check-umbraco-version.js";

describe("checkUmbracoVersion", () => {
  beforeEach(() => {
    // Clear any previous messages and reset blocked state
    clearVersionCheckMessage();
  });

  it("should not store message when major versions match", async () => {
    // Arrange
    const mockClient = {
      getServerInformation: jest.fn<() => Promise<{
        version: string;
        assemblyVersion: string;
        baseUtcOffset: string;
        runtimeMode: string;
      }>>().mockResolvedValue({
        version: "16.3.1",
        assemblyVersion: "16.3.1.0",
        baseUtcOffset: "-07:00:00",
        runtimeMode: "Production"
      })
    };

    // Act
    await checkUmbracoVersion(mockClient as any);

    // Assert - no message needed when versions match
    const message = getVersionCheckMessage();
    expect(message).toBeNull();
    expect(isToolExecutionBlocked()).toBe(false);
  });

  it("should store warning and block when major versions mismatch", async () => {
    // Arrange
    const mockClient = {
      getServerInformation: jest.fn<() => Promise<{
        version: string;
        assemblyVersion: string;
        baseUtcOffset: string;
        runtimeMode: string;
      }>>().mockResolvedValue({
        version: "15.3.1",
        assemblyVersion: "15.3.1.0",
        baseUtcOffset: "-07:00:00",
        runtimeMode: "Production"
      })
    };

    // Act
    await checkUmbracoVersion(mockClient as any);

    // Assert
    const message = getVersionCheckMessage();
    expect(message).toContain("⚠️ Version Mismatch");
    expect(message).toContain("compatibility issues");
    expect(isToolExecutionBlocked()).toBe(true);
  });

  it("should handle API errors gracefully without blocking", async () => {
    // Arrange
    const mockClient = {
      getServerInformation: jest.fn<() => Promise<{
        version: string;
        assemblyVersion: string;
        baseUtcOffset: string;
        runtimeMode: string;
      }>>().mockRejectedValue(new Error("Network error"))
    };

    // Act
    await checkUmbracoVersion(mockClient as any);

    // Assert
    const message = getVersionCheckMessage();
    expect(message).toContain("⚠️ Unable to verify");
    expect(message).toContain("Network error");
    expect(isToolExecutionBlocked()).toBe(false);
  });

  it("should handle prerelease versions correctly", async () => {
    // Arrange
    const mockClient = {
      getServerInformation: jest.fn<() => Promise<{
        version: string;
        assemblyVersion: string;
        baseUtcOffset: string;
        runtimeMode: string;
      }>>().mockResolvedValue({
        version: "16.0.0-rc1",
        assemblyVersion: "16.0.0.0",
        baseUtcOffset: "-07:00:00",
        runtimeMode: "Development"
      })
    };

    // Act
    await checkUmbracoVersion(mockClient as any);

    // Assert - should still match on major version "16", no message needed
    const message = getVersionCheckMessage();
    expect(message).toBeNull();
    expect(isToolExecutionBlocked()).toBe(false);
  });

  it("should clear message when clearVersionCheckMessage is called", async () => {
    // Arrange - use mismatch to generate a message
    const mockClient = {
      getServerInformation: jest.fn<() => Promise<{
        version: string;
        assemblyVersion: string;
        baseUtcOffset: string;
        runtimeMode: string;
      }>>().mockResolvedValue({
        version: "15.3.1",
        assemblyVersion: "15.3.1.0",
        baseUtcOffset: "-07:00:00",
        runtimeMode: "Production"
      })
    };

    // Act
    await checkUmbracoVersion(mockClient as any);
    expect(getVersionCheckMessage()).not.toBeNull();

    clearVersionCheckMessage();

    // Assert
    expect(getVersionCheckMessage()).toBeNull();
  });

  it("should unblock when clearVersionCheckMessage is called on mismatch", async () => {
    // Arrange - use mismatch to trigger blocking
    const mockClient = {
      getServerInformation: jest.fn<() => Promise<{
        version: string;
        assemblyVersion: string;
        baseUtcOffset: string;
        runtimeMode: string;
      }>>().mockResolvedValue({
        version: "15.3.1",
        assemblyVersion: "15.3.1.0",
        baseUtcOffset: "-07:00:00",
        runtimeMode: "Production"
      })
    };

    // Act
    await checkUmbracoVersion(mockClient as any);
    expect(isToolExecutionBlocked()).toBe(true);

    clearVersionCheckMessage(); // Should clear both message and blocking

    // Assert
    expect(isToolExecutionBlocked()).toBe(false);
    expect(getVersionCheckMessage()).toBeNull();
  });
});
