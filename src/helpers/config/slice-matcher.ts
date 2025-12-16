import { allSliceNames } from "./slice-registry.js";

/**
 * Validate slice names against the known slice names.
 * Returns valid and invalid names.
 */
export function validateSliceNames(names: string[]): { valid: string[], invalid: string[] } {
  const validNames = new Set<string>(allSliceNames);

  return {
    valid: names.filter(n => validNames.has(n)),
    invalid: names.filter(n => !validNames.has(n))
  };
}
