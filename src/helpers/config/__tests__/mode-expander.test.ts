// Mode Expander Tests
import {
  validateModeNames,
  expandModesToCollections,
  getModeExpansionSummary
} from "../mode-expander.js";
import {
  baseModes,
  compoundModes,
  allModes,
  allModeNames
} from "../mode-registry.js";
import { jest } from "@jest/globals";

describe('Mode Expander', () => {
  describe('validateModeNames', () => {
    it('should validate known mode names', () => {
      const result = validateModeNames(['content', 'media', 'translation']);
      expect(result.validModes).toEqual(['content', 'media', 'translation']);
      expect(result.invalidModes).toEqual([]);
    });

    it('should identify invalid mode names', () => {
      const result = validateModeNames(['content', 'invalid-mode', 'media']);
      expect(result.validModes).toEqual(['content', 'media']);
      expect(result.invalidModes).toEqual(['invalid-mode']);
    });

    it('should handle all invalid mode names', () => {
      const result = validateModeNames(['invalid1', 'invalid2']);
      expect(result.validModes).toEqual([]);
      expect(result.invalidModes).toEqual(['invalid1', 'invalid2']);
    });

    it('should handle empty array', () => {
      const result = validateModeNames([]);
      expect(result.validModes).toEqual([]);
      expect(result.invalidModes).toEqual([]);
    });

    it('should validate compound mode names', () => {
      const result = validateModeNames(['publisher', 'developer', 'admin', 'full']);
      expect(result.validModes).toEqual(['publisher', 'developer', 'admin', 'full']);
      expect(result.invalidModes).toEqual([]);
    });

    it('should validate all base mode names', () => {
      const baseModeNames = baseModes.map(m => m.name);
      const result = validateModeNames(baseModeNames);
      expect(result.validModes).toEqual(baseModeNames);
      expect(result.invalidModes).toEqual([]);
    });
  });

  describe('expandModesToCollections', () => {
    describe('base modes', () => {
      it('should expand content mode to document collections', () => {
        const result = expandModesToCollections(['content']);
        expect(result).toContain('document');
        expect(result).toContain('document-version');
        expect(result).toContain('document-blueprint');
        expect(result).toHaveLength(3);
      });

      it('should expand content-modeling mode', () => {
        const result = expandModesToCollections(['content-modeling']);
        expect(result).toContain('document');
        expect(result).toContain('document-type');
        expect(result).toContain('data-type');
        expect(result).toContain('media');
        expect(result).toContain('media-type');
        expect(result).toHaveLength(5);
      });

      it('should expand front-end mode', () => {
        const result = expandModesToCollections(['front-end']);
        expect(result).toContain('template');
        expect(result).toContain('partial-view');
        expect(result).toContain('stylesheet');
        expect(result).toContain('script');
        expect(result).toContain('static-file');
        expect(result).toHaveLength(5);
      });

      it('should expand media mode', () => {
        const result = expandModesToCollections(['media']);
        expect(result).toContain('media');
        expect(result).toContain('imaging');
        expect(result).toContain('temporary-file');
        expect(result).toHaveLength(3);
      });

      it('should expand search mode', () => {
        const result = expandModesToCollections(['search']);
        expect(result).toContain('indexer');
        expect(result).toContain('searcher');
        expect(result).toHaveLength(2);
      });

      it('should expand users mode', () => {
        const result = expandModesToCollections(['users']);
        expect(result).toContain('user');
        expect(result).toContain('user-group');
        expect(result).toContain('user-data');
        expect(result).toHaveLength(3);
      });

      it('should expand members mode', () => {
        const result = expandModesToCollections(['members']);
        expect(result).toContain('member');
        expect(result).toContain('member-type');
        expect(result).toContain('member-group');
        expect(result).toHaveLength(3);
      });

      it('should expand health mode', () => {
        const result = expandModesToCollections(['health']);
        expect(result).toContain('health');
        expect(result).toContain('log-viewer');
        expect(result).toHaveLength(2);
      });

      it('should expand translation mode', () => {
        const result = expandModesToCollections(['translation']);
        expect(result).toContain('culture');
        expect(result).toContain('language');
        expect(result).toContain('dictionary');
        expect(result).toHaveLength(3);
      });

      it('should expand system mode', () => {
        const result = expandModesToCollections(['system']);
        expect(result).toContain('server');
        expect(result).toContain('manifest');
        expect(result).toContain('models-builder');
        expect(result).toHaveLength(3);
      });

      it('should expand integrations mode', () => {
        const result = expandModesToCollections(['integrations']);
        expect(result).toContain('webhook');
        expect(result).toContain('redirect');
        expect(result).toContain('relation');
        expect(result).toContain('relation-type');
        expect(result).toContain('tag');
        expect(result).toHaveLength(5);
      });
    });

    describe('compound modes', () => {
      it('should expand publisher mode to content, media, and translation', () => {
        const result = expandModesToCollections(['publisher']);

        // Content collections
        expect(result).toContain('document');
        expect(result).toContain('document-version');
        expect(result).toContain('document-blueprint');

        // Media collections
        expect(result).toContain('media');
        expect(result).toContain('imaging');
        expect(result).toContain('temporary-file');

        // Translation collections
        expect(result).toContain('culture');
        expect(result).toContain('language');
        expect(result).toContain('dictionary');

        expect(result).toHaveLength(9);
      });

      it('should expand developer mode to content-modeling, front-end, and system', () => {
        const result = expandModesToCollections(['developer']);

        // Content-modeling collections
        expect(result).toContain('document');
        expect(result).toContain('document-type');
        expect(result).toContain('data-type');
        expect(result).toContain('media');
        expect(result).toContain('media-type');

        // Front-end collections
        expect(result).toContain('template');
        expect(result).toContain('partial-view');
        expect(result).toContain('stylesheet');
        expect(result).toContain('script');
        expect(result).toContain('static-file');

        // System collections
        expect(result).toContain('server');
        expect(result).toContain('manifest');
        expect(result).toContain('models-builder');

        expect(result).toHaveLength(13);
      });

      it('should expand admin mode to users, members, health, and system', () => {
        const result = expandModesToCollections(['admin']);

        // Users collections
        expect(result).toContain('user');
        expect(result).toContain('user-group');
        expect(result).toContain('user-data');

        // Members collections
        expect(result).toContain('member');
        expect(result).toContain('member-type');
        expect(result).toContain('member-group');

        // Health collections
        expect(result).toContain('health');
        expect(result).toContain('log-viewer');

        // System collections
        expect(result).toContain('server');
        expect(result).toContain('manifest');
        expect(result).toContain('models-builder');

        expect(result).toHaveLength(11);
      });

      it('should expand full mode to all collections', () => {
        const result = expandModesToCollections(['full']);

        // Should include all collections from all base modes
        const allBaseCollections = baseModes.flatMap(m => m.collections);
        const uniqueCollections = [...new Set(allBaseCollections)];

        expect(result).toHaveLength(uniqueCollections.length);
        uniqueCollections.forEach(collection => {
          expect(result).toContain(collection);
        });
      });
    });

    describe('multiple modes', () => {
      it('should combine multiple base modes', () => {
        const result = expandModesToCollections(['content', 'media']);

        expect(result).toContain('document');
        expect(result).toContain('document-version');
        expect(result).toContain('document-blueprint');
        expect(result).toContain('media');
        expect(result).toContain('imaging');
        expect(result).toContain('temporary-file');
        expect(result).toHaveLength(6);
      });

      it('should deduplicate collections when modes overlap', () => {
        // publisher includes media, so adding media explicitly shouldn't duplicate
        const publisherResult = expandModesToCollections(['publisher']);
        const combinedResult = expandModesToCollections(['publisher', 'media']);

        expect(combinedResult).toHaveLength(publisherResult.length);
      });

      it('should combine base and compound modes', () => {
        const result = expandModesToCollections(['publisher', 'integrations']);

        // Publisher collections
        expect(result).toContain('document');
        expect(result).toContain('media');
        expect(result).toContain('culture');

        // Integrations collections
        expect(result).toContain('webhook');
        expect(result).toContain('redirect');
        expect(result).toContain('tag');
      });
    });

    describe('edge cases', () => {
      it('should handle empty mode array', () => {
        const result = expandModesToCollections([]);
        expect(result).toEqual([]);
      });

      it('should ignore invalid mode names', () => {
        const result = expandModesToCollections(['invalid-mode']);
        expect(result).toEqual([]);
      });

      it('should process valid modes and ignore invalid ones', () => {
        const result = expandModesToCollections(['content', 'invalid-mode']);
        expect(result).toContain('document');
        expect(result).toContain('document-version');
        expect(result).toContain('document-blueprint');
        expect(result).toHaveLength(3);
      });

      it('should prevent infinite loops from circular references', () => {
        // Even if we somehow had circular mode references, it should not loop forever
        const result = expandModesToCollections(['publisher', 'publisher']);
        expect(result).toHaveLength(9); // Same as single publisher
      });
    });
  });

  describe('getModeExpansionSummary', () => {
    it('should generate summary for single mode', () => {
      const summary = getModeExpansionSummary(['content']);
      expect(summary).toContain('content');
      expect(summary).toContain('3 collections');
      expect(summary).toContain('document');
    });

    it('should generate summary for multiple modes', () => {
      const summary = getModeExpansionSummary(['content', 'media']);
      expect(summary).toContain('content');
      expect(summary).toContain('media');
      expect(summary).toContain('6 collections');
    });

    it('should generate summary for compound mode', () => {
      const summary = getModeExpansionSummary(['publisher']);
      expect(summary).toContain('publisher');
      expect(summary).toContain('9 collections');
    });
  });

  describe('Mode Registry', () => {
    it('should have 11 base modes', () => {
      expect(baseModes).toHaveLength(11);
    });

    it('should have 4 compound modes', () => {
      expect(compoundModes).toHaveLength(4);
    });

    it('should have 15 total modes', () => {
      expect(allModes).toHaveLength(15);
      expect(allModeNames).toHaveLength(15);
    });

    it('should have all base modes with collections defined', () => {
      baseModes.forEach(mode => {
        expect(mode.collections.length).toBeGreaterThan(0);
        expect(mode.modes).toBeUndefined();
      });
    });

    it('should have all compound modes with modes defined', () => {
      compoundModes.forEach(mode => {
        expect(mode.modes).toBeDefined();
        expect(mode.modes!.length).toBeGreaterThan(0);
        expect(mode.collections).toEqual([]);
      });
    });

    it('should have unique mode names', () => {
      const names = allModes.map(m => m.name);
      const uniqueNames = [...new Set(names)];
      expect(names).toHaveLength(uniqueNames.length);
    });

    it('should have full mode reference all base modes', () => {
      const fullMode = compoundModes.find(m => m.name === 'full');
      expect(fullMode).toBeDefined();

      const baseModeNames = baseModes.map(m => m.name);
      baseModeNames.forEach(name => {
        expect(fullMode!.modes).toContain(name);
      });
    });
  });
});
