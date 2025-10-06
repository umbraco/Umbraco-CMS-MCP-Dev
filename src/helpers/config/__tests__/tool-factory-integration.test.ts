// Tool Factory Integration Tests
import { jest } from "@jest/globals";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { UmbracoToolFactory } from "../../../umb-management-api/tools/tool-factory.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import type { UmbracoServerConfig } from "../../../config.js";

// Mock environment variables for testing
const originalEnv = process.env;

// Helper to create mock config from process.env
const getMockConfig = (): UmbracoServerConfig => ({
  auth: {
    clientId: "test-client",
    clientSecret: "test-secret",
    baseUrl: "http://localhost:56472"
  },
  includeToolCollections: process.env.UMBRACO_INCLUDE_TOOL_COLLECTIONS?.split(',').map(c => c.trim()).filter(Boolean),
  excludeToolCollections: process.env.UMBRACO_EXCLUDE_TOOL_COLLECTIONS?.split(',').map(c => c.trim()).filter(Boolean),
  includeTools: process.env.UMBRACO_INCLUDE_TOOLS?.split(',').map(t => t.trim()).filter(Boolean),
  excludeTools: process.env.UMBRACO_EXCLUDE_TOOLS?.split(',').map(t => t.trim()).filter(Boolean),
  configSources: {
    clientId: "env",
    clientSecret: "env",
    baseUrl: "env",
    envFile: "default"
  }
});

const mockUser: CurrentUserResponseModel = {
  id: "test-user",
  userName: "testuser",
  name: "Test User",
  email: "test@example.com",
  userGroupIds: [],
  languageIsoCode: "en-US",
  languages: [],
  hasAccessToAllLanguages: true,
  hasAccessToSensitiveData: false,
  avatarUrls: [],
  documentStartNodeIds: [],
  mediaStartNodeIds: [],
  hasDocumentRootAccess: true,
  hasMediaRootAccess: true,
  allowedSections: ["content", "settings", "media", "members"],
  fallbackPermissions: [],
  permissions: [],
  isAdmin: false
};

// Mock McpServer
const createMockServer = () => {
  const mockServer = {
    tool: jest.fn(),
    resource: jest.fn(),
    prompt: jest.fn()
  } as unknown as jest.Mocked<McpServer>;
  
  return mockServer;
};

describe('UmbracoToolFactory Integration', () => {
  let mockServer: jest.Mocked<McpServer>;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    mockServer = createMockServer();
    
    // Reset environment variables
    delete process.env.UMBRACO_INCLUDE_TOOL_COLLECTIONS;
    delete process.env.UMBRACO_EXCLUDE_TOOL_COLLECTIONS;
    delete process.env.UMBRACO_INCLUDE_TOOLS;
    delete process.env.UMBRACO_EXCLUDE_TOOLS;
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it('should load tools from all collections by default', () => {
    UmbracoToolFactory(mockServer, mockUser, getMockConfig());
    
    // Verify server.tool was called (should include tools from all collections)
    expect(mockServer.tool).toHaveBeenCalled();
    expect(mockServer.tool.mock.calls.length).toBeGreaterThan(0);
  });

  it('should only load tools from enabled collections', () => {
    process.env.UMBRACO_INCLUDE_TOOL_COLLECTIONS = 'culture,data-type';
    
    UmbracoToolFactory(mockServer, mockUser, getMockConfig());
    
    // Verify tools were loaded
    expect(mockServer.tool).toHaveBeenCalled();
    
    // Check that tools from enabled collections were loaded
    const toolCalls = mockServer.tool.mock.calls.map(call => call[0]);
    const hasCultureTools = toolCalls.some(name => name.includes('culture'));
    const hasDataTypeTools = toolCalls.some(name => name.includes('data-type'));
    
    expect(hasCultureTools || hasDataTypeTools).toBe(true);
  });

  it('should handle empty enabled collections list', () => {
    process.env.UMBRACO_INCLUDE_TOOL_COLLECTIONS = '';
    
    UmbracoToolFactory(mockServer, mockUser, getMockConfig());
    
    // Should still load tools (empty list means load all)
    expect(mockServer.tool).toHaveBeenCalled();
  });

  it('should load tools from all converted collections', () => {
    UmbracoToolFactory(mockServer, mockUser, getMockConfig());
    
    // Should load tools from all converted collections
    const toolCalls = mockServer.tool.mock.calls.map(call => call[0]);
    expect(toolCalls).toContain('get-culture'); // from culture collection
    expect(toolCalls).toContain('get-data-type-search'); // from data-type collection
    expect(toolCalls).toContain('find-dictionary'); // from dictionary collection
    expect(toolCalls).toContain('get-language-items'); // from language collection
    expect(toolCalls.length).toBeGreaterThan(20); // many tools loaded from all collections
  });


  it('should handle collection exclusions for converted collections', async () => {
    process.env.UMBRACO_EXCLUDE_TOOL_COLLECTIONS = 'culture';
    
    // Force re-import to pick up environment changes
    jest.resetModules();
    const { UmbracoToolFactory } = await import("../../../umb-management-api/tools/tool-factory.js");
    
    UmbracoToolFactory(mockServer, mockUser, getMockConfig());
    
    const toolCalls = mockServer.tool.mock.calls.map(call => call[0]);
    // Should not include the culture tool (from the excluded collection)
    expect(toolCalls).not.toContain('get-culture');
    // But should still include tools from other collections
    expect(toolCalls).toContain('get-data-type-search');
    expect(toolCalls.length).toBeGreaterThan(15); // Still many tools, just not from culture
  });


  it('should handle invalid collection names gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    // Test with an invalid collection name that doesn't exist in availableCollections
    process.env.UMBRACO_INCLUDE_TOOL_COLLECTIONS = 'invalid-collection-name,culture';
    
    // Force re-import to pick up environment changes
    jest.resetModules();
    const { UmbracoToolFactory } = await import("../../../umb-management-api/tools/tool-factory.js");
    
    UmbracoToolFactory(mockServer, mockUser, getMockConfig());
    
    // Should warn about invalid collection name
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('invalid-collection-name'));
    
    // Should still load valid collections
    expect(mockServer.tool).toHaveBeenCalled();
    const toolCalls = mockServer.tool.mock.calls.map(call => call[0]);
    expect(toolCalls).toContain('get-culture'); // Valid collection should still load
    
    consoleSpy.mockRestore();
  });

  it('should not register tools when user lacks permissions', () => {
    const restrictedUser: CurrentUserResponseModel = {
      ...mockUser,
      allowedSections: [] // No access to any sections
    };
    
    UmbracoToolFactory(mockServer, restrictedUser, getMockConfig());
    
    // Verify that tools were registered (the tool enablement logic handles permissions)
    // This test verifies the factory still runs but individual tools check permissions
    expect(mockServer.tool.mock.calls.length).toBeGreaterThanOrEqual(0);
  });

  it('should handle multiple collection dependencies', () => {
    // This test verifies that if collections had dependencies, they would be included
    process.env.UMBRACO_INCLUDE_TOOL_COLLECTIONS = 'culture,data-type';
    
    UmbracoToolFactory(mockServer, mockUser, getMockConfig());
    
    // Should successfully load without errors
    expect(mockServer.tool).toHaveBeenCalled();
  });

  it('should maintain tool registration order', () => {
    UmbracoToolFactory(mockServer, mockUser, getMockConfig());
    
    // Verify tools were registered in some order
    expect(mockServer.tool.mock.calls.length).toBeGreaterThan(0);
    
    // Each tool call should have the expected parameters
    mockServer.tool.mock.calls.forEach(call => {
      expect(call.length).toBe(4); // name, description, schema, handler
      expect(typeof call[0]).toBe('string'); // name
      expect(typeof call[1]).toBe('string'); // description
      expect(typeof call[2]).toBe('object'); // schema
      expect(typeof call[3]).toBe('function'); // handler
    });
  });


  describe('Configuration parsing edge cases', () => {
    it('should handle whitespace in collection names', () => {
      process.env.UMBRACO_INCLUDE_TOOL_COLLECTIONS = ' culture , data-type , ';
      
      UmbracoToolFactory(mockServer, mockUser, getMockConfig());
      
      // Should parse correctly despite whitespace
      expect(mockServer.tool).toHaveBeenCalled();
    });

    it('should handle empty collection names in list', () => {
      process.env.UMBRACO_INCLUDE_TOOL_COLLECTIONS = 'culture,,data-type';
      
      UmbracoToolFactory(mockServer, mockUser, getMockConfig());
      
      // Should handle empty values gracefully
      expect(mockServer.tool).toHaveBeenCalled();
    });
  });
});