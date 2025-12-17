import { ToolModeDefinition } from "../../types/tool-mode.js";
import { allModes, allModeNames } from "./mode-registry.js";

/**
 * Result of validating mode names
 */
export interface ModeValidationResult {
  validModes: string[];
  invalidModes: string[];
}

/**
 * Validate that mode names exist in the registry
 */
export function validateModeNames(modeNames: string[]): ModeValidationResult {
  const validModes: string[] = [];
  const invalidModes: string[] = [];

  for (const name of modeNames) {
    if (allModeNames.includes(name)) {
      validModes.push(name);
    } else {
      invalidModes.push(name);
    }
  }

  return { validModes, invalidModes };
}

/**
 * Expand modes to their constituent collections.
 *
 * @param modeNames - Array of mode names to expand
 * @param modeRegistry - Optional custom mode registry (defaults to allModes)
 * @returns Array of unique collection names
 */
export function expandModesToCollections(
  modeNames: string[],
  modeRegistry: ToolModeDefinition[] = allModes
): string[] {
  const collections = new Set<string>();

  for (const modeName of modeNames) {
    const mode = modeRegistry.find(m => m.name === modeName);
    if (!mode) {
      // Unknown mode - skip (validation should have caught this)
      continue;
    }

    // Add all collections from this mode
    for (const collection of mode.collections) {
      collections.add(collection);
    }
  }

  return Array.from(collections);
}

/**
 * Get a summary of what modes expand to (for logging/debugging)
 */
export function getModeExpansionSummary(modeNames: string[]): string {
  const collections = expandModesToCollections(modeNames);
  return `Modes [${modeNames.join(', ')}] expand to ${collections.length} collections: [${collections.join(', ')}]`;
}
