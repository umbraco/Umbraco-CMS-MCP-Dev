import { availableCollections } from "../../umbraco-api/tools/collection-registry.js";
import { allModes } from "../mode-registry.js";

/**
 * Modes are the groups shown on the hosted MCP consent screen (and the
 * values accepted by UMBRACO_INCLUDE_MODES). A collection that is not in any
 * mode never appears on that screen, so it cannot be granted. This happened
 * to the `element` collection when it was added for Umbraco 19.
 */
describe("mode registry", () => {
  const collectionsInModes = new Set(allModes.flatMap((m) => m.collections));

  it("includes every registered collection in at least one mode", () => {
    const missing = availableCollections
      .map((c) => c.metadata.name)
      .filter((name) => !collectionsInModes.has(name));

    expect(missing).toEqual([]);
  });

  it("only references collections that are registered", () => {
    const registered = new Set(availableCollections.map((c) => c.metadata.name));
    const unknown = [...collectionsInModes].filter((name) => !registered.has(name));

    expect(unknown).toEqual([]);
  });
});
