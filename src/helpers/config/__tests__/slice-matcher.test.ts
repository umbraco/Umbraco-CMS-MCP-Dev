// Slice Matcher Tests
import { validateSliceNames } from "../slice-matcher.js";
import { allSliceNames } from "../slice-registry.js";

describe('Slice Matcher', () => {
  describe('validateSliceNames', () => {
    it('should validate known slice names', () => {
      const result = validateSliceNames(['create', 'read', 'tree']);
      expect(result.valid).toEqual(['create', 'read', 'tree']);
      expect(result.invalid).toEqual([]);
    });

    it('should identify invalid slice names', () => {
      const result = validateSliceNames(['create', 'invalid-slice', 'tree']);
      expect(result.valid).toEqual(['create', 'tree']);
      expect(result.invalid).toEqual(['invalid-slice']);
    });

    it('should handle all invalid slice names', () => {
      const result = validateSliceNames(['invalid1', 'invalid2']);
      expect(result.valid).toEqual([]);
      expect(result.invalid).toEqual(['invalid1', 'invalid2']);
    });

    it('should handle empty array', () => {
      const result = validateSliceNames([]);
      expect(result.valid).toEqual([]);
      expect(result.invalid).toEqual([]);
    });

    it('should accept "other" as valid slice name', () => {
      const result = validateSliceNames(['other']);
      expect(result.valid).toEqual(['other']);
      expect(result.invalid).toEqual([]);
    });
  });

  describe('Slice Registry', () => {
    it('should have 31 total slice names including other', () => {
      expect(allSliceNames).toHaveLength(31);
      expect(allSliceNames).toContain('other');
    });

    it('should have unique slice names', () => {
      const uniqueNames = [...new Set(allSliceNames)];
      expect(allSliceNames).toHaveLength(uniqueNames.length);
    });

    it('should contain all expected CRUD slices', () => {
      expect(allSliceNames).toContain('create');
      expect(allSliceNames).toContain('read');
      expect(allSliceNames).toContain('update');
      expect(allSliceNames).toContain('delete');
    });

    it('should contain all expected workflow slices', () => {
      expect(allSliceNames).toContain('publish');
      expect(allSliceNames).toContain('recycle-bin');
      expect(allSliceNames).toContain('move');
      expect(allSliceNames).toContain('copy');
      expect(allSliceNames).toContain('sort');
      expect(allSliceNames).toContain('validate');
      expect(allSliceNames).toContain('rename');
    });
  });
});
