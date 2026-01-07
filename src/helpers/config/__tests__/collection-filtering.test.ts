// Collection Filtering Tests
import { CollectionConfigLoader } from "@/helpers/config/collection-config-loader.js";
import { DataTypeCollection } from "../../../umb-management-api/tools/data-type/index.js";
import { jest } from "@jest/globals";

// Mock environment variables for testing
const originalEnv = process.env;

const mockUser = {
  id: "test-user",
  userName: "testuser",
  name: "Test User",
  email: "test@example.com",
  userGroupKeys: [],
  userGroupIds: [],
  languageKeys: [],
  languageIsoCode: "en-US",
  languages: [],
  hasAccessToAllLanguages: true,
  hasAccessToSensitiveData: false,
  startContentKeys: [],
  startMediaKeys: [],
  avatarUrls: [],
  mediaStartNodeKeys: [],
  mediaStartNodeIds: [],
  documentStartNodeKeys: [],
  documentStartNodeIds: [],
  hasDocumentRootAccess: true,
  hasMediaRootAccess: true,
  allowedSections: ["content", "settings", "media", "members"],
  fallbackPermissions: [],
  permissions: [],
  isAdmin: false
};

// Mock types based on the plan
interface ToolCollectionMetadata {
  name: string;
  displayName: string;
  description: string;
  dependencies?: string[];
}

interface ToolCollectionExport {
  metadata: ToolCollectionMetadata;
  tools: (user: any) => any[];
}

interface CollectionConfiguration {
  enabledCollections: string[];
  disabledCollections: string[];
  enabledTools: string[];
  disabledTools: string[];
}

// Mock functions that would be implemented in the actual filtering system
function resolveDependencies(requestedNames: string[], collections: ToolCollectionExport[]): string[] {
  const result = new Set(requestedNames);
  const collectionMap = new Map(collections.map(c => [c.metadata.name, c]));
  
  // Recursively add dependencies
  function addDependencies(collectionName: string) {
    const collection = collectionMap.get(collectionName);
    if (collection?.metadata.dependencies) {
      collection.metadata.dependencies.forEach(dep => {
        if (!result.has(dep)) {
          result.add(dep);
          addDependencies(dep); // Recursive dependency resolution
        }
      });
    }
  }
  
  requestedNames.forEach(addDependencies);
  return Array.from(result);
}

function validateConfiguration(config: CollectionConfiguration, collections: ToolCollectionExport[]): void {
  const availableNames = new Set(collections.map(c => c.metadata.name));
  
  // Check all referenced collection names exist
  const referencedNames = [
    ...config.enabledCollections,
    ...config.disabledCollections,
    ...collections.flatMap(c => c.metadata.dependencies || [])
  ];
  
  const invalid = referencedNames.filter(name => !availableNames.has(name));
  if (invalid.length > 0) {
    console.warn(`Referenced collections don't exist: ${[...new Set(invalid)].join(', ')}`);
  }
}

function getEnabledCollections(config: CollectionConfiguration, availableCollections: ToolCollectionExport[]): ToolCollectionExport[] {
  const allCollectionNames = availableCollections.map(c => c.metadata.name);
  
  // Apply collection filtering logic (same as tool filtering)
  let enabledNames = allCollectionNames.filter(name => {
    // Always exclude collections in the disabled list
    if (config.disabledCollections.includes(name)) return false;
    
    // If enabled list exists, only include collections in that list
    if (config.enabledCollections.length > 0) {
      return config.enabledCollections.includes(name);
    }
    
    // Otherwise, include all collections (default behavior)
    return true;
  });
  
  // Resolve dependencies - add required collections
  const enabledWithDependencies = resolveDependencies(enabledNames, availableCollections);
  
  return availableCollections.filter(collection => 
    enabledWithDependencies.includes(collection.metadata.name)
  );
}

describe('Collection Filtering', () => {
  const mockCollections: ToolCollectionExport[] = [
    { 
      metadata: { 
        name: 'culture', 
        displayName: 'Culture & Localization',
        description: 'Culture and localization management',
        dependencies: [] 
      }, 
      tools: () => [] 
    },
    { 
      metadata: { 
        name: 'data-type', 
        displayName: 'Data Types',
        description: 'Data type definitions and management',
        dependencies: [] 
      }, 
      tools: () => [] 
    },
    { 
      metadata: { 
        name: 'dictionary', 
        displayName: 'Dictionary',
        description: 'Dictionary item management',
        dependencies: ['language'] 
      }, 
      tools: () => [] 
    },
    { 
      metadata: { 
        name: 'document-type', 
        displayName: 'Document Types',
        description: 'Document type definitions and composition management',
        dependencies: ['data-type'] 
      }, 
      tools: () => [] 
    },
    { 
      metadata: { 
        name: 'language', 
        displayName: 'Languages',
        description: 'Language and localization configuration',
        dependencies: [] 
      }, 
      tools: () => [] 
    },
    { 
      metadata: { 
        name: 'document-blueprint', 
        displayName: 'Document Blueprints',
        description: 'Document blueprint templates and management',
        dependencies: [] 
      }, 
      tools: () => [] 
    },
    { 
      metadata: { 
        name: 'document', 
        displayName: 'Documents',
        description: 'Document content management and publishing',
        dependencies: [] 
      }, 
      tools: () => [] 
    },
    { 
      metadata: { 
        name: 'media', 
        displayName: 'Media',
        description: 'Media asset management and organization',
        dependencies: [] 
      }, 
      tools: () => [] 
    },
    { 
      metadata: { 
        name: 'media-type', 
        displayName: 'Media Types',
        description: 'Media type definitions and composition management',
        dependencies: [] 
      }, 
      tools: () => [] 
    },
    { 
      metadata: { 
        name: 'member', 
        displayName: 'Members',
        description: 'Member account management and administration',
        dependencies: [] 
      }, 
      tools: () => [] 
    },
    { 
      metadata: { 
        name: 'member-group', 
        displayName: 'Member Groups',
        description: 'Member group management and organization',
        dependencies: [] 
      }, 
      tools: () => [] 
    },
    { 
      metadata: { 
        name: 'member-type', 
        displayName: 'Member Types',
        description: 'Member type definitions and composition management',
        dependencies: [] 
      }, 
      tools: () => [] 
    }
  ];

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('resolveDependencies', () => {
    it('should include dependencies automatically', () => {
      const result = resolveDependencies(['dictionary'], mockCollections);
      expect(result).toEqual(['dictionary', 'language']);
    });

    it('should handle nested dependencies', () => {
      const result = resolveDependencies(['document-type'], mockCollections);
      expect(result).toEqual(['document-type', 'data-type']);
    });

    it('should handle collections without dependencies', () => {
      const result = resolveDependencies(['culture'], mockCollections);
      expect(result).toEqual(['culture']);
    });

    it('should handle multiple collections with overlapping dependencies', () => {
      const result = resolveDependencies(['dictionary', 'language'], mockCollections);
      expect(result).toEqual(['dictionary', 'language']);
    });

    it('should handle empty requested names', () => {
      const result = resolveDependencies([], mockCollections);
      expect(result).toEqual([]);
    });
  });

  describe('validateConfiguration', () => {
    let consoleSpy: jest.SpiedFunction<typeof console.warn>;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should warn about invalid collection names in enabledCollections', () => {
      const config: CollectionConfiguration = { 
        enabledCollections: ['invalid-name'], 
        disabledCollections: [],
        enabledTools: [],
        disabledTools: []
      };
      
      validateConfiguration(config, mockCollections);
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('invalid-name'));
    });

    it('should warn about invalid collection names in disabledCollections', () => {
      const config: CollectionConfiguration = { 
        enabledCollections: [],
        disabledCollections: ['invalid-name'],
        enabledTools: [],
        disabledTools: []
      };
      
      validateConfiguration(config, mockCollections);
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('invalid-name'));
    });

    it('should not warn for valid collection names', () => {
      const config: CollectionConfiguration = { 
        enabledCollections: ['culture', 'dictionary'],
        disabledCollections: [],
        enabledTools: [],
        disabledTools: []
      };
      
      validateConfiguration(config, mockCollections);
      
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should warn about invalid dependency names', () => {
      const collectionsWithInvalidDep: ToolCollectionExport[] = [
        ...mockCollections,
        {
          metadata: {
            name: 'test-collection',
            displayName: 'Test',
            description: 'Test collection',
            dependencies: ['non-existent-dependency']
          },
          tools: () => []
        }
      ];

      const config: CollectionConfiguration = { 
        enabledCollections: ['test-collection'],
        disabledCollections: [],
        enabledTools: [],
        disabledTools: []
      };
      
      validateConfiguration(config, collectionsWithInvalidDep);
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('non-existent-dependency'));
    });
  });

  describe('getEnabledCollections', () => {
    it('should return all collections by default in exclude mode', () => {
      const config: CollectionConfiguration = { 
        enabledCollections: [], 
        disabledCollections: [], 
        enabledTools: [],
        disabledTools: []
      };
      const result = getEnabledCollections(config, mockCollections);
      expect(result).toHaveLength(12);
      expect(result.map(c => c.metadata.name)).toEqual([
        'culture', 'data-type', 'dictionary', 'document-type', 'language', 'document-blueprint', 'document', 'media', 'media-type', 'member', 'member-group', 'member-type'
      ]);
    });

    it('should filter to enabled collections only in include mode', () => {
      const config: CollectionConfiguration = { 
        enabledCollections: ['culture'], 
        disabledCollections: [], 
        enabledTools: [],
        disabledTools: []
      };
      const result = getEnabledCollections(config, mockCollections);
      expect(result.map(c => c.metadata.name)).toEqual(['culture']);
    });

    it('should exclude specified collections in exclude mode', () => {
      const config: CollectionConfiguration = { 
        enabledCollections: [], 
        disabledCollections: ['culture', 'dictionary'], 
        enabledTools: [],
        disabledTools: []
      };
      const result = getEnabledCollections(config, mockCollections);
      expect(result.map(c => c.metadata.name)).toEqual(['data-type', 'document-type', 'language', 'document-blueprint', 'document', 'media', 'media-type', 'member', 'member-group', 'member-type']);
    });

    it('should automatically include dependencies in include mode', () => {
      const config: CollectionConfiguration = { 
        enabledCollections: ['dictionary'], 
        disabledCollections: [], 
        enabledTools: [],
        disabledTools: []
      };
      const result = getEnabledCollections(config, mockCollections);
      expect(result.map(c => c.metadata.name)).toContain('dictionary');
      expect(result.map(c => c.metadata.name)).toContain('language');
    });

    it('should return all collections when no enabled collections specified in include mode', () => {
      const config: CollectionConfiguration = { 
        enabledCollections: [], 
        disabledCollections: [], 
        enabledTools: [],
        disabledTools: []
      };
      const result = getEnabledCollections(config, mockCollections);
      expect(result).toHaveLength(12);
    });

    it('should handle complex dependency chains', () => {
      const config: CollectionConfiguration = { 
        enabledCollections: ['document-type'], 
        disabledCollections: [], 
        enabledTools: [],
        disabledTools: []
      };
      const result = getEnabledCollections(config, mockCollections);
      const names = result.map(c => c.metadata.name);
      expect(names).toContain('document-type');
      expect(names).toContain('data-type');
    });
  });

  describe('Configuration Loading', () => {
    it('should parse comma-separated collection names', () => {
      const serverConfig = {
        auth: { clientId: 'test', clientSecret: 'test', baseUrl: 'http://test' },
        includeToolCollections: ['culture', 'data-type', 'document'],
        excludeToolCollections: [],
        includeTools: [],
        excludeTools: [],
        configSources: {
          clientId: 'env' as const,
          clientSecret: 'env' as const,
          baseUrl: 'env' as const,
          envFile: 'default' as const
        }
      };

      const config = CollectionConfigLoader.loadFromConfig(serverConfig);

      expect(config.enabledCollections).toEqual(['culture', 'data-type', 'document']);
    });

    it('should handle empty values', () => {
      const serverConfig = {
        auth: { clientId: 'test', clientSecret: 'test', baseUrl: 'http://test' },
        includeToolCollections: [],
        excludeToolCollections: [],
        includeTools: [],
        excludeTools: [],
        configSources: {
          clientId: 'env' as const,
          clientSecret: 'env' as const,
          baseUrl: 'env' as const,
          envFile: 'default' as const
        }
      };

      const config = CollectionConfigLoader.loadFromConfig(serverConfig);

      expect(config.enabledCollections).toEqual([]);
    });

    it('should load configuration structure correctly', () => {
      const serverConfig = {
        auth: { clientId: 'test', clientSecret: 'test', baseUrl: 'http://test' },
        includeToolCollections: undefined,
        excludeToolCollections: undefined,
        includeTools: undefined,
        excludeTools: undefined,
        configSources: {
          clientId: 'env' as const,
          clientSecret: 'env' as const,
          baseUrl: 'env' as const,
          envFile: 'default' as const
        }
      };

      const config = CollectionConfigLoader.loadFromConfig(serverConfig);

      expect(config).toHaveProperty('enabledCollections');
      expect(config).toHaveProperty('disabledCollections');
      expect(config).toHaveProperty('enabledTools');
      expect(config).toHaveProperty('disabledTools');
      expect(Array.isArray(config.enabledCollections)).toBe(true);
      expect(Array.isArray(config.disabledCollections)).toBe(true);
      expect(Array.isArray(config.enabledTools)).toBe(true);
      expect(Array.isArray(config.disabledTools)).toBe(true);
    });
  });

});