// Mode Expander Tests
import {
  validateModeNames,
  expandModesToCollections,
  getModeExpansionSummary
} from "../mode-expander.js";
import {
  baseModes,
  allModes,
  allModeNames
} from "../mode-registry.js";

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
        expect(result).toContain('tag');
        expect(result).toHaveLength(4);
      });

      it('should expand content-modeling mode', () => {
        const result = expandModesToCollections(['content-modeling']);
        expect(result).toContain('document-type');
        expect(result).toContain('data-type');
        expect(result).toContain('media-type');
        expect(result).toHaveLength(3);
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
        expect(result).toHaveLength(4);
      });
    });

    describe('multiple modes', () => {
      it('should combine multiple base modes', () => {
        const result = expandModesToCollections(['content', 'media']);

        expect(result).toContain('document');
        expect(result).toContain('document-version');
        expect(result).toContain('document-blueprint');
        expect(result).toContain('tag');
        expect(result).toContain('media');
        expect(result).toContain('imaging');
        expect(result).toContain('temporary-file');
        expect(result).toHaveLength(7);
      });

      it('should deduplicate collections when modes overlap', () => {
        // content-modeling includes media, so adding media explicitly shouldn't duplicate
        const contentModelingResult = expandModesToCollections(['content-modeling']);
        const combinedResult = expandModesToCollections(['content-modeling', 'media']);

        // content-modeling has: document, document-type, data-type, media, media-type (5)
        // media mode has: media, imaging, temporary-file
        // Combined should be 7 (media is shared)
        expect(combinedResult).toHaveLength(6);
        expect(combinedResult).toContain('media');
        expect(combinedResult).toContain('imaging');
        expect(combinedResult).toContain('temporary-file');
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
        expect(result).toContain('tag');
        expect(result).toHaveLength(4);
      });

      it('should handle duplicate mode names', () => {
        const result = expandModesToCollections(['content', 'content']);
        expect(result).toHaveLength(4); // Same as single content mode
      });
    });
  });

  describe('getModeExpansionSummary', () => {
    it('should generate summary for single mode', () => {
      const summary = getModeExpansionSummary(['content']);
      expect(summary).toContain('content');
      expect(summary).toContain('4 collections');
      expect(summary).toContain('document');
    });

    it('should generate summary for multiple modes', () => {
      const summary = getModeExpansionSummary(['content', 'media']);
      expect(summary).toContain('content');
      expect(summary).toContain('media');
      expect(summary).toContain('7 collections');
    });

  });

  describe('Mode Registry', () => {
    it('should have 11 base modes', () => {
      expect(baseModes).toHaveLength(11);
    });

    it('should have 11 total modes (no compound modes)', () => {
      expect(allModes).toHaveLength(11);
      expect(allModeNames).toHaveLength(11);
    });

    it('should have all modes with collections defined', () => {
      allModes.forEach(mode => {
        expect(mode.collections.length).toBeGreaterThan(0);
      });
    });

    it('should have unique mode names', () => {
      const names = allModes.map(m => m.name);
      const uniqueNames = [...new Set(names)];
      expect(names).toHaveLength(uniqueNames.length);
    });
  });
});
