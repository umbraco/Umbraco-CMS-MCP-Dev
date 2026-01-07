import { jest } from "@jest/globals";
import {
  checkUmbracoVersion,
  getVersionCheckMessage,
  clearVersionCheckMessage,
  isToolExecutionBlocked,
  versionCheckService,
  VersionCheckService
} from "../check-umbraco-version.js";

describe("VersionCheckService", () => {
  let service: VersionCheckService;

  beforeEach(() => {
    service = new VersionCheckService();
  });

  it("should start with null message and not blocked", () => {
    expect(service.getMessage()).toBeNull();
    expect(service.isBlocked()).toBe(false);
  });

  it("should set and get message", () => {
    service.setMessage("test message");
    expect(service.getMessage()).toBe("test message");
  });

  it("should set and get blocked state", () => {
    service.setBlocked(true);
    expect(service.isBlocked()).toBe(true);
    service.setBlocked(false);
    expect(service.isBlocked()).toBe(false);
  });

  it("should clear message and blocked state", () => {
    service.setMessage("test message");
    service.setBlocked(true);
    service.clear();
    expect(service.getMessage()).toBeNull();
    expect(service.isBlocked()).toBe(false);
  });

  it("should reset state", () => {
    service.setMessage("test message");
    service.setBlocked(true);
    service.reset();
    expect(service.getMessage()).toBeNull();
    expect(service.isBlocked()).toBe(false);
  });
});

describe("checkUmbracoVersion", () => {
  beforeEach(() => {
    // Reset the singleton service state between tests
    versionCheckService.reset();
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
        version: "17.3.1",
        assemblyVersion: "17.3.1.0",
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
        version: "17.0.0-rc1",
        assemblyVersion: "17.0.0.0",
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
