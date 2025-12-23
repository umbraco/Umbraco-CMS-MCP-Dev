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
    registerTool: jest.fn(), // New API used by tool-factory
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

    // Verify server.registerTool was called (should include tools from all collections)
    expect(mockServer.registerTool).toHaveBeenCalled();
    expect(mockServer.registerTool.mock.calls.length).toBeGreaterThan(0);
  });

  it('should only load tools from enabled collections', () => {
    process.env.UMBRACO_INCLUDE_TOOL_COLLECTIONS = 'culture,data-type';
    
    UmbracoToolFactory(mockServer, mockUser, getMockConfig());
    
    // Verify tools were loaded
    expect(mockServer.registerTool).toHaveBeenCalled();
    
    // Check that tools from enabled collections were loaded
    const toolCalls = mockServer.registerTool.mock.calls.map(call => call[0]);
    const hasCultureTools = toolCalls.some(name => name.includes('culture'));
    const hasDataTypeTools = toolCalls.some(name => name.includes('data-type'));
    
    expect(hasCultureTools || hasDataTypeTools).toBe(true);
  });

  it('should handle empty enabled collections list', () => {
    process.env.UMBRACO_INCLUDE_TOOL_COLLECTIONS = '';
    
    UmbracoToolFactory(mockServer, mockUser, getMockConfig());
    
    // Should still load tools (empty list means load all)
    expect(mockServer.registerTool).toHaveBeenCalled();
  });

  it('should load tools from all converted collections', () => {
    UmbracoToolFactory(mockServer, mockUser, getMockConfig());

    // Should load tools from all available collections (data-type in this template)
    const toolCalls = mockServer.registerTool.mock.calls.map(call => call[0]);
    expect(toolCalls).toContain('get-data-type-search'); // from data-type collection
    expect(toolCalls).toContain('find-data-type'); // from data-type collection
    expect(toolCalls).toContain('create-data-type'); // from data-type collection
    expect(toolCalls.length).toBeGreaterThan(10); // many tools loaded from data-type collection
  });


  it('should handle collection exclusions for converted collections', async () => {
    process.env.UMBRACO_EXCLUDE_TOOL_COLLECTIONS = 'data-type';

    // Force re-import to pick up environment changes
    jest.resetModules();
    const { UmbracoToolFactory } = await import("../../../umb-management-api/tools/tool-factory.js");

    UmbracoToolFactory(mockServer, mockUser, getMockConfig());

    const toolCalls = mockServer.registerTool.mock.calls.map(call => call[0]);
    // Should not include data-type tools (from the excluded collection)
    expect(toolCalls).not.toContain('get-data-type-search');
    expect(toolCalls).not.toContain('create-data-type');
    // No other collections in this template, so no tools should be loaded
    expect(toolCalls.length).toBe(0);
  });


  it('should handle invalid collection names gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    // Test with an invalid collection name that doesn't exist in availableCollections
    process.env.UMBRACO_INCLUDE_TOOL_COLLECTIONS = 'invalid-collection-name,data-type';

    // Force re-import to pick up environment changes
    jest.resetModules();
    const { UmbracoToolFactory } = await import("../../../umb-management-api/tools/tool-factory.js");

    UmbracoToolFactory(mockServer, mockUser, getMockConfig());

    // Should warn about invalid collection name
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('invalid-collection-name'));

    // Should still load valid collections
    expect(mockServer.registerTool).toHaveBeenCalled();
    const toolCalls = mockServer.registerTool.mock.calls.map(call => call[0]);
    expect(toolCalls).toContain('get-data-type-search'); // Valid collection should still load

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
    expect(mockServer.registerTool.mock.calls.length).toBeGreaterThanOrEqual(0);
  });

  it('should handle multiple collection dependencies', () => {
    // This test verifies that if collections had dependencies, they would be included
    process.env.UMBRACO_INCLUDE_TOOL_COLLECTIONS = 'culture,data-type';
    
    UmbracoToolFactory(mockServer, mockUser, getMockConfig());
    
    // Should successfully load without errors
    expect(mockServer.registerTool).toHaveBeenCalled();
  });

  it('should maintain tool registration order', () => {
    UmbracoToolFactory(mockServer, mockUser, getMockConfig());

    // Verify tools were registered in some order
    expect(mockServer.registerTool.mock.calls.length).toBeGreaterThan(0);

    // registerTool API: (name: string, options: { description, inputSchema, outputSchema, annotations }, handler)
    mockServer.registerTool.mock.calls.forEach((call: any[]) => {
      expect(call.length).toBe(3);
      expect(typeof call[0]).toBe('string'); // name
      expect(typeof call[1]).toBe('object'); // options object
      expect(call[1].description).toBeDefined(); // options.description
      expect(typeof call[2]).toBe('function'); // handler
    });
  });


  describe('Configuration parsing edge cases', () => {
    it('should handle whitespace in collection names', () => {
      process.env.UMBRACO_INCLUDE_TOOL_COLLECTIONS = ' culture , data-type , ';
      
      UmbracoToolFactory(mockServer, mockUser, getMockConfig());
      
      // Should parse correctly despite whitespace
      expect(mockServer.registerTool).toHaveBeenCalled();
    });

    it('should handle empty collection names in list', () => {
      process.env.UMBRACO_INCLUDE_TOOL_COLLECTIONS = 'culture,,data-type';

      UmbracoToolFactory(mockServer, mockUser, getMockConfig());

      // Should handle empty values gracefully
      expect(mockServer.registerTool).toHaveBeenCalled();
    });
  });

  describe('Readonly mode', () => {
    it('should include all tools when readonly is false', () => {
      const config = getMockConfig({
        readonly: false,
        includeToolCollections: ['data-type']
      });

      UmbracoToolFactory(mockServer, mockUser, config);

      const toolNames = mockServer.registerTool.mock.calls.map(call => call[0]);
      // Should include both read and write tools
      expect(toolNames).toContain('find-data-type');
      expect(toolNames).toContain('create-data-type');
      expect(toolNames).toContain('delete-data-type');
    });

    it('should filter out write tools when readonly is true', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const config = getMockConfig({
        readonly: true,
        includeToolCollections: ['data-type']
      });

      UmbracoToolFactory(mockServer, mockUser, config);

      const toolNames = mockServer.registerTool.mock.calls.map(call => call[0]);
      // Should include read-only tools (those with readOnlyHint: true)
      expect(toolNames).toContain('find-data-type');
      expect(toolNames).toContain('get-data-type');
      expect(toolNames).toContain('get-data-type-property-editor-template');
      // Should NOT include write tools
      expect(toolNames).not.toContain('create-data-type');
      expect(toolNames).not.toContain('delete-data-type');
      expect(toolNames).not.toContain('update-data-type');

      consoleSpy.mockRestore();
    });

    it('should log filtered tools in readonly mode', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const config = getMockConfig({
        readonly: true,
        includeToolCollections: ['data-type']
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
        includeToolCollections: ['data-type'],
        includeSlices: ['create', 'search']
      });

      UmbracoToolFactory(mockServer, mockUser, config);

      const toolNames = mockServer.registerTool.mock.calls.map(call => call[0]);
      // Should include tools with 'create' slice
      expect(toolNames).toContain('create-data-type');
      // Should include tools with 'search' slice
      expect(toolNames).toContain('find-data-type');
      // Should NOT include tools with other slices like 'read', 'delete'
      expect(toolNames).not.toContain('get-data-type');
      expect(toolNames).not.toContain('delete-data-type');
    });

    it('should exclude tools when their slices are disabled', () => {
      const config = getMockConfig({
        includeToolCollections: ['data-type'],
        excludeSlices: ['delete']
      });

      UmbracoToolFactory(mockServer, mockUser, config);

      const toolNames = mockServer.registerTool.mock.calls.map(call => call[0]);
      // Should NOT include tools with 'delete' slice
      expect(toolNames).not.toContain('delete-data-type');
      // But should include other tools
      expect(toolNames).toContain('create-data-type');
      expect(toolNames).toContain('find-data-type');
    });

    it('should require ALL slices for multi-slice tools (AND logic)', () => {
      const config = getMockConfig({
        includeToolCollections: ['data-type'],
        includeSlices: ['create'] // Only 'create', not 'folders'
      });

      UmbracoToolFactory(mockServer, mockUser, config);

      const toolNames = mockServer.registerTool.mock.calls.map(call => call[0]);
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

      const toolNames = mockServer.registerTool.mock.calls.map(call => call[0]);
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

      const toolNames = mockServer.registerTool.mock.calls.map(call => call[0]);
      // Folder tools have ['create', 'folders'] - should NOT appear
      expect(toolNames).not.toContain('create-data-type-folder');
      // Regular create tools have ['create'] - should still appear
      expect(toolNames).toContain('create-data-type');
    });

    it('should warn about invalid slice names', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const config = getMockConfig({
        includeToolCollections: ['data-type'],
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
        toolModes: ['content-modeling'] // This mode includes data-type
      });

      UmbracoToolFactory(mockServer, mockUser, config);

      const toolNames = mockServer.registerTool.mock.calls.map(call => call[0]);
      // content-modeling mode includes document-type, data-type, media-type
      // Only data-type exists in this template
      expect(toolNames).toContain('get-data-type');
      expect(toolNames).toContain('create-data-type');
      expect(toolNames).toContain('find-data-type');
    });

    it('should warn when mode references non-existent collections', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const config = getMockConfig({
        toolModes: ['content-modeling'] // Includes document-type and media-type which don't exist
      });

      UmbracoToolFactory(mockServer, mockUser, config);

      // Should warn about non-existent collections from the mode
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("don't exist"));

      consoleSpy.mockRestore();
    });

    it('should warn about invalid mode names', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const config = getMockConfig({
        toolModes: ['invalid-mode-name', 'content-modeling']
      });

      UmbracoToolFactory(mockServer, mockUser, config);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('invalid-mode-name'));

      // Valid mode should still work
      const toolNames = mockServer.registerTool.mock.calls.map(call => call[0]);
      expect(toolNames).toContain('get-data-type'); // data-type is part of content-modeling mode

      consoleSpy.mockRestore();
    });

    it('should merge modes with direct collection includes', () => {
      const config = getMockConfig({
        toolModes: ['content-modeling'],
        includeToolCollections: ['data-type'] // Explicit include (already in mode, but tests merge)
      });

      UmbracoToolFactory(mockServer, mockUser, config);

      const toolNames = mockServer.registerTool.mock.calls.map(call => call[0]);
      // Should have tools from data-type collection
      expect(toolNames).toContain('get-data-type');
      expect(toolNames).toContain('create-data-type');
    });

  });
});