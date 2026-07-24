import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// Define the property schema that this helper expects
const propertySchema = z.object({
  name: z.string().min(1, "Property name is required"),
  alias: z.string().min(1, "Property alias is required"),
  dataTypeId: z.string().uuid("Must be a valid UUID"),
  tab: z.string().optional(),
  group: z.string().optional()
});

export type Property = z.infer<typeof propertySchema>;

export interface Container {
  id: string;
  name: string;
  type: "Tab" | "Group";
  parent: { id: string } | null;
  sortOrder: number;
}

interface ContainerCreationResult {
  containers: Container[];
  containerIds: Map<string, string>;
}

/**
 * Creates the container hierarchy for an element type based on property tab and group assignments.
 * Uses composite keys (tab::group) to support same group name in different tabs.
 * @param properties The properties array from the element type model
 * @returns An object containing the containers array and a map of container names/keys to their IDs
 */
export function createContainerHierarchy(properties: Property[]): ContainerCreationResult {
  const containerIds = new Map<string, string>();

  // Collect unique tabs
  const tabs = new Set<string>();
  properties.forEach(prop => {
    if (prop.tab) tabs.add(prop.tab);
  });

  // Collect unique tab+group combinations (not just group names)
  interface GroupKey {
    groupName: string;
    tabName: string | undefined;
  }

  const groupKeys = new Map<string, GroupKey>();
  properties.forEach(prop => {
    if (prop.group) {
      // Create unique key for this tab+group combination
      const key = `${prop.tab || 'NO_TAB'}::${prop.group}`;
      if (!groupKeys.has(key)) {
        groupKeys.set(key, {
          groupName: prop.group,
          tabName: prop.tab
        });
      }
    }
  });

  // Create tab containers first
  const containers: Container[] = Array.from(tabs).map((tabName, index) => {
    const id = uuidv4();
    containerIds.set(tabName, id);
    return {
      id,
      name: tabName,
      type: "Tab" as const,
      parent: null,
      sortOrder: index
    };
  });

  // Create group containers with unique IDs per tab+group combination
  const groupContainers = Array.from(groupKeys.entries()).map(([key, groupKey], index) => {
    const id = uuidv4();
    containerIds.set(key, id);  // Store by composite key
    return {
      id,
      name: groupKey.groupName,
      type: "Group" as const,
      parent: groupKey.tabName ? { id: containerIds.get(groupKey.tabName)! } : null,
      sortOrder: index
    };
  });

  containers.push(...groupContainers);

  return { containers, containerIds };
} 