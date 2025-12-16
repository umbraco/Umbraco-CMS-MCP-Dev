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
 * Handles compound modes by recursively expanding them first.
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
  const expandedModes = new Set<string>();

  function expandMode(modeName: string): void {
    // Prevent infinite loops from circular references
    if (expandedModes.has(modeName)) {
      return;
    }
    expandedModes.add(modeName);

    const mode = modeRegistry.find(m => m.name === modeName);
    if (!mode) {
      // Unknown mode - skip (validation should have caught this)
      return;
    }

    // If this is a compound mode, expand its child modes first
    if (mode.modes && mode.modes.length > 0) {
      for (const childModeName of mode.modes) {
        expandMode(childModeName);
      }
    }

    // Add all collections from this mode
    if (mode.collections && mode.collections.length > 0) {
      for (const collection of mode.collections) {
        collections.add(collection);
      }
    }
  }

  // Expand each requested mode
  for (const modeName of modeNames) {
    expandMode(modeName);
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
