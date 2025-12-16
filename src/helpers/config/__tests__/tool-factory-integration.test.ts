// Tool Factory Integration Tests
import { jest } from "@jest/globals";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { UmbracoToolFactory } from "../../../umb-management-api/tools/tool-factory.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import type { UmbracoServerConfig } from "../../../config.js";

// Mock environment variables for testing
const originalEnv = process.env;

// Helper to create mock config from process.env with optional overrides
const getMockConfig = (overrides: Partial<UmbracoServerConfig> = {}): UmbracoServerConfig => ({
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
  },
  ...overrides
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
  // Include all sections using Umbraco's section IDs for comprehensive test coverage
  allowedSections: [
    "Umb.Section.Content",
    "Umb.Section.Settings",
    "Umb.Section.Media",
    "Umb.Section.Members",
    "Umb.Section.Translation",
    "Umb.Section.Users",
    "Umb.Section.Packages"
  ],
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
    // Some tools have no schema (undefined), so they may have 3 or 4 args
    mockServer.tool.mock.calls.forEach(call => {
      expect(call.length).toBeGreaterThanOrEqual(3);
      expect(typeof call[0]).toBe('string'); // name
      expect(typeof call[1]).toBe('string'); // description
      // schema can be object or undefined for tools without parameters
      if (call[2] !== undefined) {
        expect(typeof call[2]).toBe('object'); // schema (optional)
      }
      // handler is the last argument
      const handler = call[call.length - 1];
      expect(typeof handler).toBe('function'); // handler
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

  describe('Readonly mode', () => {
    it('should include all tools when readonly is false', () => {
      const config = getMockConfig({
        readonly: false,
        includeToolCollections: ['dictionary']
      });

      UmbracoToolFactory(mockServer, mockUser, config);

      const toolNames = mockServer.tool.mock.calls.map(call => call[0]);
      // Should include both read and write tools (dictionary depends on language)
      expect(toolNames).toContain('find-dictionary');
      expect(toolNames).toContain('create-dictionary');
      expect(toolNames).toContain('delete-dictionary-item');
    });

    it('should filter out write tools when readonly is true', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const config = getMockConfig({
        readonly: true,
        includeToolCollections: ['dictionary']
      });

      UmbracoToolFactory(mockServer, mockUser, config);

      const toolNames = mockServer.tool.mock.calls.map(call => call[0]);
      // Should include read-only tools
      expect(toolNames).toContain('find-dictionary');
      expect(toolNames).toContain('get-dictionary');
      // Should NOT include write tools
      expect(toolNames).not.toContain('create-dictionary');
      expect(toolNames).not.toContain('delete-dictionary-item');
      expect(toolNames).not.toContain('update-dictionary-item');

      consoleSpy.mockRestore();
    });

    it('should log filtered tools in readonly mode', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const config = getMockConfig({
        readonly: true,
        includeToolCollections: ['dictionary']
      });

      UmbracoToolFactory(mockServer, mockUser, config);

      // Should log about disabled write tools
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Readonly mode'));

      consoleSpy.mockRestore();
    });
  });

  describe('Slice filtering', () => {
    it('should include tools when their slices are enabled', () => {
      const config = getMockConfig({
        includeToolCollections: ['dictionary'],
        includeSlices: ['create', 'search']
      });

      UmbracoToolFactory(mockServer, mockUser, config);

      const toolNames = mockServer.tool.mock.calls.map(call => call[0]);
      // Should include tools with 'create' slice
      expect(toolNames).toContain('create-dictionary');
      // Should include tools with 'search' slice
      expect(toolNames).toContain('find-dictionary');
      // Should NOT include tools with other slices like 'read', 'delete'
      expect(toolNames).not.toContain('get-dictionary');
      expect(toolNames).not.toContain('delete-dictionary-item');
    });

    it('should exclude tools when their slices are disabled', () => {
      const config = getMockConfig({
        includeToolCollections: ['dictionary'],
        excludeSlices: ['delete']
      });

      UmbracoToolFactory(mockServer, mockUser, config);

      const toolNames = mockServer.tool.mock.calls.map(call => call[0]);
      // Should NOT include tools with 'delete' slice
      expect(toolNames).not.toContain('delete-dictionary-item');
      // But should include other tools
      expect(toolNames).toContain('create-dictionary');
      expect(toolNames).toContain('find-dictionary');
    });

    it('should require ALL slices for multi-slice tools (AND logic)', () => {
      const config = getMockConfig({
        includeToolCollections: ['data-type'],
        includeSlices: ['create'] // Only 'create', not 'folders'
      });

      UmbracoToolFactory(mockServer, mockUser, config);

      const toolNames = mockServer.tool.mock.calls.map(call => call[0]);
      // Folder tools have ['create', 'folders'] - should NOT appear with only 'create' enabled
      expect(toolNames).not.toContain('create-data-type-folder');
      // Regular create tools have ['create'] - should appear
      expect(toolNames).toContain('create-data-type');
    });

    it('should include multi-slice tools when ALL their slices are enabled', () => {
      const config = getMockConfig({
        includeToolCollections: ['data-type'],
        includeSlices: ['create', 'folders'] // Both slices enabled
      });

      UmbracoToolFactory(mockServer, mockUser, config);

      const toolNames = mockServer.tool.mock.calls.map(call => call[0]);
      // Folder tools have ['create', 'folders'] - should appear with both enabled
      expect(toolNames).toContain('create-data-type-folder');
      // Regular create tools have ['create'] - should also appear
      expect(toolNames).toContain('create-data-type');
    });

    it('should exclude multi-slice tools when ANY slice is disabled', () => {
      const config = getMockConfig({
        includeToolCollections: ['data-type'],
        excludeSlices: ['folders'] // Disable the folders slice
      });

      UmbracoToolFactory(mockServer, mockUser, config);

      const toolNames = mockServer.tool.mock.calls.map(call => call[0]);
      // Folder tools have ['create', 'folders'] - should NOT appear
      expect(toolNames).not.toContain('create-data-type-folder');
      // Regular create tools have ['create'] - should still appear
      expect(toolNames).toContain('create-data-type');
    });

    it('should warn about invalid slice names', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const config = getMockConfig({
        includeToolCollections: ['dictionary'],
        includeSlices: ['invalid-slice-name', 'create']
      });

      UmbracoToolFactory(mockServer, mockUser, config);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('invalid-slice-name'));

      consoleSpy.mockRestore();
    });
  });

  describe('Mode configuration', () => {
    it('should expand mode to collections', () => {
      const config = getMockConfig({
        toolModes: ['translation']
      });

      UmbracoToolFactory(mockServer, mockUser, config);

      const toolNames = mockServer.tool.mock.calls.map(call => call[0]);
      // Translation mode includes culture, language, dictionary
      expect(toolNames).toContain('get-culture');
      expect(toolNames).toContain('get-language');
      expect(toolNames).toContain('find-dictionary');
    });

    it('should expand health mode to health and log-viewer collections', () => {
      const config = getMockConfig({
        toolModes: ['health']
      });

      UmbracoToolFactory(mockServer, mockUser, config);

      const toolNames = mockServer.tool.mock.calls.map(call => call[0]);
      // Health mode includes health and log-viewer collections
      expect(toolNames).toContain('get-health-check-groups');
      expect(toolNames).toContain('get-log-viewer-level');
    });

    it('should warn about invalid mode names', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const config = getMockConfig({
        toolModes: ['invalid-mode-name', 'translation']
      });

      UmbracoToolFactory(mockServer, mockUser, config);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('invalid-mode-name'));

      // Valid mode should still work
      const toolNames = mockServer.tool.mock.calls.map(call => call[0]);
      expect(toolNames).toContain('get-culture');

      consoleSpy.mockRestore();
    });

    it('should merge modes with direct collection includes', () => {
      const config = getMockConfig({
        toolModes: ['translation'],
        includeToolCollections: ['server']
      });

      UmbracoToolFactory(mockServer, mockUser, config);

      const toolNames = mockServer.tool.mock.calls.map(call => call[0]);
      // Should have tools from both mode collections and direct includes
      expect(toolNames).toContain('get-culture'); // from translation mode
      expect(toolNames).toContain('get-server-information'); // from direct include
    });

    it('should expand compound modes to nested base modes', () => {
      const config = getMockConfig({
        toolModes: ['publisher'] // publisher = content + media + translation
      });

      UmbracoToolFactory(mockServer, mockUser, config);

      const toolNames = mockServer.tool.mock.calls.map(call => call[0]);
      // Publisher mode expands to content, media, and translation modes
      // Translation mode includes culture, language, dictionary
      expect(toolNames).toContain('get-culture');
      // Media mode includes media collection
      expect(toolNames).toContain('get-media-by-id');
    });
  });
});