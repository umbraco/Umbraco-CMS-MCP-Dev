// Collection Config Loader with Modes Tests
import { CollectionConfigLoader } from "../collection-config-loader.js";
import { jest } from "@jest/globals";

describe('CollectionConfigLoader with Modes', () => {
  let consoleSpy: jest.SpiedFunction<typeof console.warn>;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  const baseServerConfig = {
    auth: { clientId: 'test', clientSecret: 'test', baseUrl: 'http://test' },
    configSources: {
      clientId: 'env' as const,
      clientSecret: 'env' as const,
      baseUrl: 'env' as const,
      envFile: 'default' as const
    }
  };

  describe('mode expansion', () => {
    it('should expand single mode to collections', () => {
      const serverConfig = {
        ...baseServerConfig,
        toolModes: ['content']
      };

      const config = CollectionConfigLoader.loadFromConfig(serverConfig);

      expect(config.enabledCollections).toContain('document');
      expect(config.enabledCollections).toContain('document-version');
      expect(config.enabledCollections).toContain('document-blueprint');
      expect(config.enabledCollections).toHaveLength(3);
    });

    it('should expand multiple modes to collections', () => {
      const serverConfig = {
        ...baseServerConfig,
        toolModes: ['content', 'media']
      };

      const config = CollectionConfigLoader.loadFromConfig(serverConfig);

      // Content collections
      expect(config.enabledCollections).toContain('document');
      expect(config.enabledCollections).toContain('document-version');
      expect(config.enabledCollections).toContain('document-blueprint');

      // Media collections
      expect(config.enabledCollections).toContain('media');
      expect(config.enabledCollections).toContain('imaging');
      expect(config.enabledCollections).toContain('temporary-file');

      expect(config.enabledCollections).toHaveLength(6);
    });

    it('should expand compound mode to collections', () => {
      const serverConfig = {
        ...baseServerConfig,
        toolModes: ['publisher']
      };

      const config = CollectionConfigLoader.loadFromConfig(serverConfig);

      // Content collections
      expect(config.enabledCollections).toContain('document');
      expect(config.enabledCollections).toContain('document-version');
      expect(config.enabledCollections).toContain('document-blueprint');

      // Media collections
      expect(config.enabledCollections).toContain('media');
      expect(config.enabledCollections).toContain('imaging');
      expect(config.enabledCollections).toContain('temporary-file');

      // Translation collections
      expect(config.enabledCollections).toContain('culture');
      expect(config.enabledCollections).toContain('language');
      expect(config.enabledCollections).toContain('dictionary');

      expect(config.enabledCollections).toHaveLength(9);
    });
  });

  describe('mode validation', () => {
    it('should warn about invalid mode names', () => {
      const serverConfig = {
        ...baseServerConfig,
        toolModes: ['content', 'invalid-mode', 'media']
      };

      CollectionConfigLoader.loadFromConfig(serverConfig);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('invalid-mode')
      );
    });

    it('should process valid modes even when some are invalid', () => {
      const serverConfig = {
        ...baseServerConfig,
        toolModes: ['invalid-mode', 'content']
      };

      const config = CollectionConfigLoader.loadFromConfig(serverConfig);

      expect(config.enabledCollections).toContain('document');
      expect(config.enabledCollections).toContain('document-version');
      expect(config.enabledCollections).toContain('document-blueprint');
    });

    it('should not warn when all modes are valid', () => {
      const serverConfig = {
        ...baseServerConfig,
        toolModes: ['content', 'media']
      };

      CollectionConfigLoader.loadFromConfig(serverConfig);

      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe('mode + collection merging', () => {
    it('should merge modes with explicit includeToolCollections', () => {
      const serverConfig = {
        ...baseServerConfig,
        toolModes: ['content'],
        includeToolCollections: ['webhook']
      };

      const config = CollectionConfigLoader.loadFromConfig(serverConfig);

      // Mode collections
      expect(config.enabledCollections).toContain('document');
      expect(config.enabledCollections).toContain('document-version');
      expect(config.enabledCollections).toContain('document-blueprint');

      // Explicit collection
      expect(config.enabledCollections).toContain('webhook');

      expect(config.enabledCollections).toHaveLength(4);
    });

    it('should deduplicate when mode and explicit include overlap', () => {
      const serverConfig = {
        ...baseServerConfig,
        toolModes: ['content'],
        includeToolCollections: ['document'] // Already in content mode
      };

      const config = CollectionConfigLoader.loadFromConfig(serverConfig);

      expect(config.enabledCollections).toHaveLength(3);
      expect(config.enabledCollections.filter(c => c === 'document')).toHaveLength(1);
    });
  });

  describe('mode + exclude behavior', () => {
    it('should still apply excludeToolCollections after mode expansion', () => {
      const serverConfig = {
        ...baseServerConfig,
        toolModes: ['content'],
        excludeToolCollections: ['document-version']
      };

      const config = CollectionConfigLoader.loadFromConfig(serverConfig);

      expect(config.enabledCollections).toContain('document');
      expect(config.enabledCollections).toContain('document-blueprint');
      // document-version is excluded via disabledCollections
      expect(config.disabledCollections).toContain('document-version');
    });
  });

  describe('no modes specified', () => {
    it('should return empty enabledCollections when no modes or includes specified', () => {
      const serverConfig = {
        ...baseServerConfig,
        toolModes: undefined,
        includeToolCollections: undefined
      };

      const config = CollectionConfigLoader.loadFromConfig(serverConfig);

      expect(config.enabledCollections).toEqual([]);
    });

    it('should return empty enabledCollections when modes is empty array', () => {
      const serverConfig = {
        ...baseServerConfig,
        toolModes: [],
        includeToolCollections: undefined
      };

      const config = CollectionConfigLoader.loadFromConfig(serverConfig);

      expect(config.enabledCollections).toEqual([]);
    });
  });

  describe('full mode', () => {
    it('should expand full mode to all base mode collections', () => {
      const serverConfig = {
        ...baseServerConfig,
        toolModes: ['full']
      };

      const config = CollectionConfigLoader.loadFromConfig(serverConfig);

      // Should include collections from all base modes
      // Content
      expect(config.enabledCollections).toContain('document');
      // Media
      expect(config.enabledCollections).toContain('media');
      // Translation
      expect(config.enabledCollections).toContain('dictionary');
      // Users
      expect(config.enabledCollections).toContain('user');
      // Members
      expect(config.enabledCollections).toContain('member');
      // Health
      expect(config.enabledCollections).toContain('health');
      // System
      expect(config.enabledCollections).toContain('server');
      // Integrations
      expect(config.enabledCollections).toContain('webhook');
      // Front-end
      expect(config.enabledCollections).toContain('template');
      // Search
      expect(config.enabledCollections).toContain('indexer');
      // Content-modeling
      expect(config.enabledCollections).toContain('document-type');

      // Total should be 36 (all collections)
      expect(config.enabledCollections.length).toBeGreaterThanOrEqual(30);
    });
  });

  describe('tool filtering', () => {
    it('should preserve tool-level filtering settings', () => {
      const serverConfig = {
        ...baseServerConfig,
        toolModes: ['content'],
        includeTools: ['get-document'],
        excludeTools: ['delete-document']
      };

      const config = CollectionConfigLoader.loadFromConfig(serverConfig);

      expect(config.enabledTools).toEqual(['get-document']);
      expect(config.disabledTools).toEqual(['delete-document']);
    });
  });
});
