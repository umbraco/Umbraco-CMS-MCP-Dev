// Collection Filtering Tests
import { CollectionConfigLoader } from "@/helpers/config/collection-config-loader.js";
import { CultureCollection } from "../../../umb-management-api/tools/culture/index.js";
import { DataTypeCollection } from "../../../umb-management-api/tools/data-type/index.js";
import { DictionaryCollection } from "../../../umb-management-api/tools/dictionary/index.js";
import { DocumentTypeCollection } from "../../../umb-management-api/tools/document-type/index.js";
import { LanguageCollection } from "../../../umb-management-api/tools/language/index.js";
import { DocumentBlueprintCollection } from "../../../umb-management-api/tools/document-blueprint/index.js";
import { DocumentCollection } from "../../../umb-management-api/tools/document/index.js";
import { MediaCollection } from "../../../umb-management-api/tools/media/index.js";
import { MediaTypeCollection } from "../../../umb-management-api/tools/media-type/index.js";
import { MemberCollection } from "../../../umb-management-api/tools/member/index.js";
import { MemberGroupCollection } from "../../../umb-management-api/tools/member-group/index.js";
import { MemberTypeCollection } from "../../../umb-management-api/tools/member-type/index.js";
import { LogViewerCollection } from "../../../umb-management-api/tools/log-viewer/index.js";
import { PartialViewCollection } from "../../../umb-management-api/tools/partial-view/index.js";
import { PropertyTypeCollection } from "../../../umb-management-api/tools/property-type/index.js";
import { TemplateCollection } from "../../../umb-management-api/tools/template/index.js";
import { WebhookCollection } from "../../../umb-management-api/tools/webhook/index.js";
import { ServerCollection } from "../../../umb-management-api/tools/server/index.js";
import { RedirectCollection } from "../../../umb-management-api/tools/redirect/index.js";
import { UserGroupCollection } from "../../../umb-management-api/tools/user-group/index.js";
import { TemporaryFileCollection } from "../../../umb-management-api/tools/temporary-file/index.js";
import { ScriptCollection } from "../../../umb-management-api/tools/script/index.js";
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

  describe('Collection Structure Integration', () => {
    it('should have valid CultureCollection structure', () => {
      expect(CultureCollection.metadata).toBeDefined();
      expect(CultureCollection.metadata.name).toBe('culture');
      expect(CultureCollection.metadata.displayName).toBe('Culture & Localization');
      expect(CultureCollection.metadata.dependencies).toEqual([]);
      expect(typeof CultureCollection.tools).toBe('function');
      
      const tools = CultureCollection.tools(mockUser);
      expect(Array.isArray(tools)).toBe(true);
    });

    it('should have valid DataTypeCollection structure', () => {
      expect(DataTypeCollection.metadata).toBeDefined();
      expect(DataTypeCollection.metadata.name).toBe('data-type');
      expect(DataTypeCollection.metadata.displayName).toBe('Data Types');
      expect(DataTypeCollection.metadata.dependencies).toEqual([]);
      expect(typeof DataTypeCollection.tools).toBe('function');
      
      const tools = DataTypeCollection.tools(mockUser);
      expect(Array.isArray(tools)).toBe(true);
    });

    it('should have valid DictionaryCollection structure', () => {
      expect(DictionaryCollection.metadata).toBeDefined();
      expect(DictionaryCollection.metadata.name).toBe('dictionary');
      expect(DictionaryCollection.metadata.displayName).toBe('Dictionary');
      expect(DictionaryCollection.metadata.dependencies).toEqual(['language']);
      expect(typeof DictionaryCollection.tools).toBe('function');
      
      const tools = DictionaryCollection.tools(mockUser);
      expect(Array.isArray(tools)).toBe(true);
    });

    it('should have valid DocumentTypeCollection structure', () => {
      expect(DocumentTypeCollection.metadata).toBeDefined();
      expect(DocumentTypeCollection.metadata.name).toBe('document-type');
      expect(DocumentTypeCollection.metadata.displayName).toBe('Document Types');
      expect(typeof DocumentTypeCollection.tools).toBe('function');
      
      const tools = DocumentTypeCollection.tools(mockUser);
      expect(Array.isArray(tools)).toBe(true);
    });

    it('should have valid LanguageCollection structure', () => {
      expect(LanguageCollection.metadata).toBeDefined();
      expect(LanguageCollection.metadata.name).toBe('language');
      expect(LanguageCollection.metadata.displayName).toBe('Languages');
      expect(LanguageCollection.metadata.dependencies).toEqual([]);
      expect(typeof LanguageCollection.tools).toBe('function');
      
      const tools = LanguageCollection.tools(mockUser);
      expect(Array.isArray(tools)).toBe(true);
    });

    it('should have valid DocumentBlueprintCollection structure', () => {
      expect(DocumentBlueprintCollection.metadata).toBeDefined();
      expect(DocumentBlueprintCollection.metadata.name).toBe('document-blueprint');
      expect(DocumentBlueprintCollection.metadata.displayName).toBe('Document Blueprints');
      expect(DocumentBlueprintCollection.metadata.dependencies).toEqual(['document-type', 'document']);
      expect(typeof DocumentBlueprintCollection.tools).toBe('function');
      
      const tools = DocumentBlueprintCollection.tools(mockUser);
      expect(Array.isArray(tools)).toBe(true);
    });

    it('should have valid DocumentCollection structure', () => {
      expect(DocumentCollection.metadata).toBeDefined();
      expect(DocumentCollection.metadata.name).toBe('document');
      expect(DocumentCollection.metadata.displayName).toBe('Documents');
      expect(DocumentCollection.metadata.dependencies).toEqual([]);
      expect(typeof DocumentCollection.tools).toBe('function');
      
      const tools = DocumentCollection.tools(mockUser);
      expect(Array.isArray(tools)).toBe(true);
    });

    it('should have valid MediaCollection structure', () => {
      expect(MediaCollection.metadata).toBeDefined();
      expect(MediaCollection.metadata.name).toBe('media');
      expect(MediaCollection.metadata.displayName).toBe('Media');
      expect(MediaCollection.metadata.dependencies).toEqual(['temporary-file']);
      expect(typeof MediaCollection.tools).toBe('function');
      
      const tools = MediaCollection.tools(mockUser);
      expect(Array.isArray(tools)).toBe(true);
    });

    it('should have valid MediaTypeCollection structure', () => {
      expect(MediaTypeCollection.metadata).toBeDefined();
      expect(MediaTypeCollection.metadata.name).toBe('media-type');
      expect(MediaTypeCollection.metadata.displayName).toBe('Media Types');
      expect(MediaTypeCollection.metadata.dependencies).toEqual([]);
      expect(typeof MediaTypeCollection.tools).toBe('function');
      
      const tools = MediaTypeCollection.tools(mockUser);
      expect(Array.isArray(tools)).toBe(true);
    });

    it('should have valid MemberCollection structure', () => {
      expect(MemberCollection.metadata).toBeDefined();
      expect(MemberCollection.metadata.name).toBe('member');
      expect(MemberCollection.metadata.displayName).toBe('Members');
      expect(MemberCollection.metadata.dependencies).toEqual([]);
      expect(typeof MemberCollection.tools).toBe('function');
      
      const tools = MemberCollection.tools(mockUser);
      expect(Array.isArray(tools)).toBe(true);
    });

    it('should have valid MemberGroupCollection structure', () => {
      expect(MemberGroupCollection.metadata).toBeDefined();
      expect(MemberGroupCollection.metadata.name).toBe('member-group');
      expect(MemberGroupCollection.metadata.displayName).toBe('Member Groups');
      expect(MemberGroupCollection.metadata.dependencies).toEqual(['member', 'member-type']);
      expect(typeof MemberGroupCollection.tools).toBe('function');
      
      const tools = MemberGroupCollection.tools(mockUser);
      expect(Array.isArray(tools)).toBe(true);
    });

    it('should have valid MemberTypeCollection structure', () => {
      expect(MemberTypeCollection.metadata).toBeDefined();
      expect(MemberTypeCollection.metadata.name).toBe('member-type');
      expect(MemberTypeCollection.metadata.displayName).toBe('Member Types');
      expect(MemberTypeCollection.metadata.dependencies).toEqual(['member', 'member-group']);
      expect(typeof MemberTypeCollection.tools).toBe('function');
      
      const tools = MemberTypeCollection.tools(mockUser);
      expect(Array.isArray(tools)).toBe(true);
    });

    it('should have valid LogViewerCollection structure', () => {
      expect(LogViewerCollection.metadata).toBeDefined();
      expect(LogViewerCollection.metadata.name).toBe('log-viewer');
      expect(LogViewerCollection.metadata.displayName).toBe('Log Viewer');
      expect(LogViewerCollection.metadata.dependencies).toEqual([]);
      expect(typeof LogViewerCollection.tools).toBe('function');
      
      const tools = LogViewerCollection.tools(mockUser);
      expect(Array.isArray(tools)).toBe(true);
    });

    it('should have valid PartialViewCollection structure', () => {
      expect(PartialViewCollection.metadata).toBeDefined();
      expect(PartialViewCollection.metadata.name).toBe('partial-view');
      expect(PartialViewCollection.metadata.displayName).toBe('Partial Views');
      expect(PartialViewCollection.metadata.dependencies).toEqual([]);
      expect(typeof PartialViewCollection.tools).toBe('function');
      
      const tools = PartialViewCollection.tools(mockUser);
      expect(Array.isArray(tools)).toBe(true);
    });

    it('should have valid PropertyTypeCollection structure', () => {
      expect(PropertyTypeCollection.metadata).toBeDefined();
      expect(PropertyTypeCollection.metadata.name).toBe('property-type');
      expect(PropertyTypeCollection.metadata.displayName).toBe('Property Types');
      expect(PropertyTypeCollection.metadata.dependencies).toEqual([]);
      expect(typeof PropertyTypeCollection.tools).toBe('function');
      
      const tools = PropertyTypeCollection.tools(mockUser);
      expect(Array.isArray(tools)).toBe(true);
    });

    it('should have valid TemplateCollection structure', () => {
      expect(TemplateCollection.metadata).toBeDefined();
      expect(TemplateCollection.metadata.name).toBe('template');
      expect(TemplateCollection.metadata.displayName).toBe('Templates');
      expect(TemplateCollection.metadata.dependencies).toEqual([]);
      expect(typeof TemplateCollection.tools).toBe('function');
      
      const tools = TemplateCollection.tools(mockUser);
      expect(Array.isArray(tools)).toBe(true);
    });

    it('should have valid WebhookCollection structure', () => {
      expect(WebhookCollection.metadata).toBeDefined();
      expect(WebhookCollection.metadata.name).toBe('webhook');
      expect(WebhookCollection.metadata.displayName).toBe('Webhooks');
      expect(WebhookCollection.metadata.dependencies).toEqual([]);
      expect(typeof WebhookCollection.tools).toBe('function');
      
      const tools = WebhookCollection.tools(mockUser);
      expect(Array.isArray(tools)).toBe(true);
    });

    it('should have valid ServerCollection structure', () => {
      expect(ServerCollection.metadata).toBeDefined();
      expect(ServerCollection.metadata.name).toBe('server');
      expect(ServerCollection.metadata.displayName).toBe('Server');
      expect(ServerCollection.metadata.dependencies).toEqual([]);
      expect(typeof ServerCollection.tools).toBe('function');
      
      const tools = ServerCollection.tools(mockUser);
      expect(Array.isArray(tools)).toBe(true);
    });

    it('should have valid RedirectCollection structure', () => {
      expect(RedirectCollection.metadata).toBeDefined();
      expect(RedirectCollection.metadata.name).toBe('redirect');
      expect(RedirectCollection.metadata.displayName).toBe('Redirects');
      expect(RedirectCollection.metadata.dependencies).toEqual([]);
      expect(typeof RedirectCollection.tools).toBe('function');
      
      const tools = RedirectCollection.tools(mockUser);
      expect(Array.isArray(tools)).toBe(true);
    });

    it('should have valid UserGroupCollection structure', () => {
      expect(UserGroupCollection.metadata).toBeDefined();
      expect(UserGroupCollection.metadata.name).toBe('user-group');
      expect(UserGroupCollection.metadata.displayName).toBe('User Groups');
      expect(UserGroupCollection.metadata.dependencies).toEqual([]);
      expect(typeof UserGroupCollection.tools).toBe('function');
      
      const tools = UserGroupCollection.tools(mockUser);
      expect(Array.isArray(tools)).toBe(true);
    });

    it('should have valid TemporaryFileCollection structure', () => {
      expect(TemporaryFileCollection.metadata).toBeDefined();
      expect(TemporaryFileCollection.metadata.name).toBe('temporary-file');
      expect(TemporaryFileCollection.metadata.displayName).toBe('Temporary Files');
      expect(TemporaryFileCollection.metadata.dependencies).toEqual(['media']);
      expect(typeof TemporaryFileCollection.tools).toBe('function');
      
      const tools = TemporaryFileCollection.tools(mockUser);
      expect(Array.isArray(tools)).toBe(true);
    });

    it('should have valid ScriptCollection structure', () => {
      expect(ScriptCollection.metadata).toBeDefined();
      expect(ScriptCollection.metadata.name).toBe('script');
      expect(ScriptCollection.metadata.displayName).toBe('Scripts');
      expect(ScriptCollection.metadata.dependencies).toEqual([]);
      expect(typeof ScriptCollection.tools).toBe('function');
      
      const tools = ScriptCollection.tools(mockUser);
      expect(Array.isArray(tools)).toBe(true);
    });
  });
});